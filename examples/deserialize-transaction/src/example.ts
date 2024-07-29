/**
 * EXAMPLE
 * Deserialize and inspect a transaction with @solana/web3.js.
 *
 * Before running any of the examples in this monorepo, make sure to set up a test validator by
 * running `pnpm test:live-with-test-validator:setup` in the root directory.
 *
 * To run this example, execute `pnpm start` in this directory.
 */
import { createLogger } from '@solana/example-utils/createLogger.js';
import {
    Address,
    appendTransactionMessageInstructions,
    assertAccountDecoded,
    assertAccountExists,
    assertIsInstructionWithAccounts,
    assertIsInstructionWithData,
    compressTransactionMessageUsingAddressLookupTables,
    createKeyPairSignerFromBytes,
    createSolanaRpc,
    createTransactionMessage,
    decodeTransactionMessage,
    fetchJsonParsedAccount,
    getAddressEncoder,
    getBase64EncodedWireTransaction,
    getBase64Encoder,
    getCompiledTransactionMessageDecoder,
    getTransactionDecoder,
    lamports,
    partiallySignTransactionMessageWithSigners,
    pipe,
    setTransactionMessageFeePayer,
    setTransactionMessageLifetimeUsingBlockhash,
    verifySignature,
} from '@solana/web3.js';
import { getAddMemoInstruction, MEMO_PROGRAM_ADDRESS, parseAddMemoInstruction } from '@solana-program/memo';
import {
    getTransferSolInstruction,
    identifySystemInstruction,
    parseTransferSolInstruction,
    SystemInstruction,
} from '@solana-program/system';

const log = createLogger('Deserialize');

/**
 * SETUP: LOOKUP TABLE ADDRESS
 * Our fixtures include a lookup table, which we're going to use for this transaction
 * This is the address of the lookup table account from `scripts/fixtures/example-deserialize-transaction-address-lookup-table.json`
 */
const LOOKUP_TABLE_ADDRESS = 'DUbh3qSh4Vvxa52LGtCBCcuvAEMh62FLNkupnsBjhrCc' as Address;
log.info({ address: LOOKUP_TABLE_ADDRESS }, '[setup] Setting lookup table address');

/**
 * SETUP: RPC CONNECTION
 * While in this example we won't send the transaction, we will use the remote procedure call (RPC) server to:
 * - fetch the blockhash for the transaction lifetime
 * - fetch the address lookup table used in the transaction
 *
 * This example uses your local test validator which must be running before you run this script.
 */
const rpc = createSolanaRpc('http://127.0.0.1:8899');

/**
 * SETUP: TRANSACTION LIFETIME
 * We will fetch the latest blockhash, which we will use as the transaction's lifetime
 * See `examples/transfer-lamports` for more detail on transaction lifetime
 */
const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
log.info(latestBlockhash, '[setup] Got a blockhash');

/**
 * SETUP: CREATE A TRANSACTION MESSAGE
 * We create a transaction that sends lamports from a source account to a destination account,
 * where the destination account is in the lookup table.
 * We will then serialize this transaction, and then explore how to deserialize and inspect it.
 * See the `transfer-lamports` example for more detailed documentation on creating, signing and sending a transaction.
 */
const SOURCE_ACCOUNT_SIGNER = await createKeyPairSignerFromBytes(
    /**
     * These are the bytes that we saved at the time this account's key pair was originally
     * generated. Here, they are inlined into the source code, but you can also imagine them being
     * loaded from disk or, better yet, read from an environment variable.
     */
    new Uint8Array(
        // prettier-ignore
        [2, 194, 94, 194, 31, 15, 34, 248, 159, 9, 59, 156, 194, 152, 79, 148, 81, 17, 63, 53, 245, 175, 37, 0, 134, 90, 111, 236, 245, 160, 3, 50, 196, 59, 123, 60, 59, 151, 65, 255, 27, 247, 241, 230, 52, 54, 143, 136, 108, 160, 7, 128, 4, 14, 232, 119, 234, 61, 47, 158, 9, 241, 48, 140],
    ), // Address: ED1WqT2hWJLSZtj4TtTdoovmpMrr7zpkUdbfxmcJR1Fq
);
log.info({ address: SOURCE_ACCOUNT_SIGNER.address }, '[setup] Loaded key pair for source account');

// This is the first address in the lookup table
const DESTINATION_ADDRESS = 'F1Vc6AGoxXLwGB7QV8f4So3C5d8SXEk3KKGHxKGEJ8qn' as Address;
log.info({ address: DESTINATION_ADDRESS }, '[setup] Setting destination address');

/**
 * This is an arbitrary address that we set as the fee payer
 * In this example we won't send the transaction so it doesn't matter if this account is funded
 */
const FEE_PAYER_ADDRESS = '9xaf9RQvmr47tcKZ2y8KdpcSn6KyymGU6PZAFC9AKjPd' as Address;
log.info({ address: FEE_PAYER_ADDRESS }, '[setup] Setting fee payer address');

const transactionMessage = pipe(
    createTransactionMessage({ version: 0 }),
    tx => setTransactionMessageFeePayer(FEE_PAYER_ADDRESS, tx),
    tx => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    tx =>
        appendTransactionMessageInstructions(
            [
                getTransferSolInstruction({
                    amount: lamports(12345678n),
                    destination: DESTINATION_ADDRESS,
                    source: SOURCE_ACCOUNT_SIGNER,
                }),
                getAddMemoInstruction({
                    memo: 'hello from @solana/web3.js',
                }),
            ],
            tx,
        ),
);
log.info('[setup] Created the transaction message');

/**
 * SETUP: COMPRESS WITH LOOKUP TABLE
 * As the destination of our transfer SOL instruction is in our lookup table, we can use the
 * lookup table to compress the transaction.
 *
 * This will modify the accounts referred to in the transaction, so that where possible they
 * refer to an index of an address lookup table instead of an address directly. This makes the
 * transaction smaller when it is compiled, particularly if many addresses can use a lookup table.
 */

// The only data from the lookup table we need is its addresses
type LookupTableData = {
    addresses: Address[];
};

// We fetch the JSON parsed representation of the lookup table from the RPC
const lookupTableAccount = await fetchJsonParsedAccount<LookupTableData>(rpc, LOOKUP_TABLE_ADDRESS);
assertAccountDecoded(lookupTableAccount);
assertAccountExists(lookupTableAccount);

const transactionMessageWithLookupTables = compressTransactionMessageUsingAddressLookupTables(transactionMessage, {
    [LOOKUP_TABLE_ADDRESS]: lookupTableAccount.data.addresses,
});
log.info(`[setup] Compressed the transaction message using lookup table ${LOOKUP_TABLE_ADDRESS}`);

/**
 * SETUP: PARTIALLY SIGN THE TRANSACTION
 * A Solana transaction can have multiple signers that must sign before it is sent to the network.
 * In our case the fee payer and the source account would both need to sign the transaction
 * We used a signer for the source account, so it will sign it when we call `signTransactionMessageWithSigners`
 * But we only used an address for the fee payer, and we don't have its private key to sign the transaction
 * So we will use `partiallySignTransactionMessageWithSigners` to get a transaction that has been signed by
 * the source account, but not by the fee payer.
 */
const signedTransaction = await partiallySignTransactionMessageWithSigners(transactionMessageWithLookupTables);
log.info(`[setup] Partially signed the transaction with a signature from ${SOURCE_ACCOUNT_SIGNER.address}`);

/**
 * SETUP: ENCODE THE TRANSACTION AS BASE64
 * This is a common format to send a transaction between different systems
 * If you wanted to convert it to a byte array instead, you could do this:
 *
 * ```ts
 * const transactionEncoder = getTransactionEncoder();
 * const transactionBytes = transactionEncoder.encode(signedTransaction);
 * ```
 */
const base64EncodedTransaction = getBase64EncodedWireTransaction(signedTransaction);
log.info(`[setup] Encoded the transaction as base64: ${base64EncodedTransaction.slice(0, 64)}...`);

/**
 * SETUP COMPLETE
 * At this point, imagine we've received `base64EncodedTransaction` as input and don't know anything about it
 * Let's use web3js to decode and inspect it
 */

/**
 * STEP 1: DECODE TO TRANSACTION
 * @solana/web3.js has encoders/decoders for many Solana data structures and common data formats,
 * including both base64 strings and our `Transaction` data structure
 * To convert between these, we first encode to a byte array, and then decode to the
 * desired data structure.
 * In our case we first encode the `base64EncodedTransaction` to a byte array, and then
 * decode to a `Transaction`.
 * If we had instead received a byte array `transactionBytes` then we would just skip
 * the base64 encode step
 */
const base64Encoder = getBase64Encoder();
const transactionBytes = base64Encoder.encode(base64EncodedTransaction);

const transactionDecoder = getTransactionDecoder();
const decodedTransaction = transactionDecoder.decode(transactionBytes);
log.info('[step 1] Decoded the transaction');

/**
 * First let's inspect the signatures on our decoded transaction
 * `signatures` is a map from `Address` to `SignatureBytes | null`
 * If the address has signed the transaction then we can access their signature
 * If not then `null` will be stored
 */

for (const [address, maybeSignature] of Object.entries(decodedTransaction.signatures)) {
    if (maybeSignature) {
        log.info(`[step 1] ${address} has signed the transaction`);
    } else {
        log.info(`[step 1] ${address} is required to sign the transaction but hasn't yet`);
    }
}

// Now we know that we have a signature for `ED1WqT2hWJLSZtj4TtTdoovmpMrr7zpkUdbfxmcJR1Fq`
// Let's verify that it's correct
const signedByAddress = 'ED1WqT2hWJLSZtj4TtTdoovmpMrr7zpkUdbfxmcJR1Fq' as Address;
const signedBySignature = decodedTransaction.signatures[signedByAddress]!;
// We encode the source address to bytes
const sourceAddressBytes = getAddressEncoder().encode(signedByAddress);
// Then we create a public Ed25519 key with those bytes
// This is a SubtleCrypto CryptoKey object that we create with role `verify`
const signedByPublicKey = await crypto.subtle.importKey('raw', sourceAddressBytes, 'Ed25519', true, ['verify']);
// Now we can verify the signature using that key
const verifiedSignature = await verifySignature(signedByPublicKey, signedBySignature, decodedTransaction.messageBytes);
log.info(
    `[step 1] The signature for ${signedByAddress} is ${verifiedSignature ? 'valid' : 'not valid'} for the transaction`,
);

/**
 * STEP 2: DECODE TO COMPILED TRANSACTION MESSAGE
 * We verified the signature is valid for the `messageBytes` field of the Transaction. This is a byte array
 * representing the compiled version of the `TransactionMessage`. If we decode this we can see some information
 * about the transaction. Let's do that next.
 */

// Again we have a decoder to convert from bytes to a Solana data structure, in this case the `CompiledTransactionMessage`
const compiledTransactionMessageDecoder = getCompiledTransactionMessageDecoder();
const compiledTransactionMessage = compiledTransactionMessageDecoder.decode(decodedTransaction.messageBytes);

// This gives us the data stucture `CompiledTransactionMessage`. This is the format that transactions are
// compiled to before the entire transaction is encoded to base64 to be sent to the Solana network.

// Let's inspect some fields of `compiledTransactionMessage`
// We can see its version:
log.info(`[step 2] The transaction is version ${compiledTransactionMessage.version}`);

// We can see the lifetime token, though we don't have enough context yet to know if it's a blockhash or a durable nonce
log.info(
    `[step 2] We can see the transaction lifetime token, but we don't know if it's a blockhash or durable nonce: ${compiledTransactionMessage.lifetimeToken}`,
);

// We can see the static accounts:
log.info(compiledTransactionMessage.staticAccounts, '[step 2] Static accounts of the transaction');

// Note that the destination address (F1Vc6AGoxXLwGB7QV8f4So3C5d8SXEk3KKGHxKGEJ8qn) is not here, as it comes from the lookup table

// The `addressLookupTables` field is only included for non-legacy transactions
// Here we tell Typescript to narrow the type to exclude legacy transactions
if (compiledTransactionMessage.version === 'legacy') {
    throw new Error('We used version: 0');
}

// Now we can view address lookup tables:
log.info(compiledTransactionMessage.addressTableLookups, '[step 2] Address lookup tables for the transaction');

// We see that the transaction uses our address lookup table.

// Let's look at a compiled instruction
log.info(
    { ...compiledTransactionMessage.instructions[0], data: '(removed for brevity)' },
    '[step 2] The first instruction of the compiled transaction message',
);

/**
 * This is the SOL transfer instruction
 * The program account index is 2, which matches the system program (1111...) in our static accounts
 * The first account index is 1, which matches the signer we used as the source address
 * But the second account index is 4, which is outside our array of static accounts.
 * We need to resolve the lookup table in order to know what address this actually is
 */

/**
 * STEP 3: DECOMPILING THE TRANSACTION MESSAGE
 * Let's decompile the transaction message into a structure that is easier to inspect and parse
 * To decompile this transaction message, we need to know the addresses in this lookup table
 * If we already have the addresses in this lookup table fetched, then we can pass them to
 * `decompileTransactionMessage` without fetching them again. Like so:
 *
 * ```ts
 * const decompiledTransactionMessage = decompileTransactionMessage(compiledTransactionMessage, {
 *   addressesByLookupTableAddress: {
 *     [LOOKUP_TABLE_ADDRESS]: lookupTableAccount.data.addresses,
 *   },
 * });
 * ```
 *
 * But let's pretend that we don't already have that data fetched, we've just received the
 * transaction and need to decode it. We will use `decodeTransactionMessage` instead
 *
 * This will use the RPC to fetch the address lookup table data for us, and then use it to
 * decompile the transaction message.
 */

const decodedTransactionMessage = await decodeTransactionMessage(compiledTransactionMessage, rpc);

// This is our `TransactionMessage` structure, which is much easier to understand and parse
// This is the same data structure that was created before we first signed the transaction

// We can see the fee payer:
log.info(`[step 3] The transaction fee payer is ${decodedTransactionMessage.feePayer}`);

// And the lifetime constraint:
log.info(decodedTransactionMessage.lifetimeConstraint, '[step 3] The transaction lifetime constraint');

/**
 * Here we can see that the lifetime constraint is actually a blockhash
 * The `decompileTransactionMessage` call inspects the transaction and can distinguish
 * between blockhash and nonce for us
 * We can also narrow this type with typescript
 */
if ('blockhash' in decodedTransactionMessage.lifetimeConstraint) {
    log.info(`[step 3] The transaction blockhash is ${decodedTransactionMessage.lifetimeConstraint.blockhash}`);
}

/**
 * Note that the `lastValidBlockHeight` won't necessarily match that used when the transaction
 * was first created. This is not encoded into the transaction, so we can't decode it back out
 * By default `decodeTransactionMessage` and `decompileTransactionMessage` will fetch the current
 * `lastValidBlockHeight` and use that
 * But if you know the correct value, you can pass it like so:
 *
 * ```ts
 * const decodedTransactionMessage = await decodeTransactionMessage(compiledTransactionMessage, rpc, {
 *   lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
 * })
 * ```
 */

// We can also view the decompiled instructions here
log.info(
    { ...decodedTransactionMessage.instructions[0], data: '(removed for brevity)' },
    '[step 3] The first decoded instruction',
);

/**
 * We can see the programAddress is `11111111111111111111111111111111`
 * We no longer need to look this up in a list of accounts from an index
 *
 * We also see the address of each account
 * For the second account, we have its address, as well as the lookup table it comes from
 * Decompiling the transaction message unpacks all the lookup accounts for us
 */

// We removed the data array for brevity when we logged the instructions, but let's take a look at it now
log.info(decodedTransactionMessage.instructions[0].data, '[step 3] The data bytes of the first instruction');

// This is opaque, it's just a byte array, but it encodes exactly what the instruction is actually doing
// Let's look next at how we can make sense of it

/**
 * STEP 4: PARSING THE INSTRUCTIONS
 * To understand what is actually happening in each instruction, we need to decode the data field
 * We will do this by using the generated `@solana-program/system` client, which can decode data
 * from the @solana/web3.js instruction data structure for the System program
 * We know from the program address (11111111111111111111111111111111) that the first instruction
 * is to the system program
 * You can generate such a client for any Solana program using Kinobi
 * See https://github.com/kinobi-so/kinobi for more information on Kinobi
 */

const firstInstruction = decodedTransactionMessage.instructions[0];
// Narrow the type, the `identifySystemInstruction` requires data to identify an instruction
assertIsInstructionWithData(firstInstruction);
const identifiedInstruction = identifySystemInstruction(firstInstruction);

// We can compare the `identifiedInstruction` to the enum values, like this
if (identifiedInstruction === SystemInstruction.TransferSol) {
    log.info('[step 4] The first instruction calls the TransferSol instruction of the system program');
    // Narrow the type again, the instruction must have accounts to be parsed as a transfer SOL instruction
    assertIsInstructionWithAccounts(firstInstruction);
    const parsedFirstInstruction = parseTransferSolInstruction(firstInstruction);
    log.info(parsedFirstInstruction, '[step 4] The parsed Transfer SOL instruction');

    // This gives us an understanding of what exactly is happening in the instruction
    // We can see the source address, the destination address, and the amount of lamports
    const { accounts, data } = parsedFirstInstruction;
    log.info(
        `[step 4] In the first instruction, ${accounts.source.address} transfers ${data.amount.toLocaleString()} lamports to ${accounts.destination.address}`,
    );
}

// Now let's do the same with the second instruction
const secondInstruction = decodedTransactionMessage.instructions[1];
log.info(`[step 4] The second instruction calls the ${secondInstruction.programAddress} program`);

// We know that the second instruction is to the memo program, but we can also programmatically check this
// Each generated client exposes its program address as a constant
if (secondInstruction.programAddress === MEMO_PROGRAM_ADDRESS) {
    log.info(`[step 4] The second instruction calls the memo program`);
}

// The memo program only has one instruction, so there is no `identify` function
// We know it's always an addMemo instruction

assertIsInstructionWithData(secondInstruction);
const parsedSecondInstruction = parseAddMemoInstruction(secondInstruction);
log.info(parsedSecondInstruction, '[step 4] The parsed Add Memo instruction');
log.info(`[step 4] The second instruction adds a memo with message "${parsedSecondInstruction.data.memo}"`);

// We've now parsed both instructions, and we know exactly what the transaction does
