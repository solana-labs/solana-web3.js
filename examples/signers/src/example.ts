/**
 * EXAMPLE
 * Create and use signers with @solana/web3.js.
 *
 * Before running any of the examples in this monorepo, make sure to set up a test validator by
 * running `pnpm test:live-with-test-validator:setup` in the root directory.
 *
 * To run this example, execute `pnpm start` in this directory.
 */
import { createLogger } from '@solana/example-utils/createLogger.js';
import {
    address,
    appendTransactionMessageInstruction,
    Blockhash,
    CompilableTransactionMessage,
    compileTransaction,
    createKeyPairSignerFromBytes,
    createKeyPairSignerFromPrivateKeyBytes,
    createNoopSigner,
    createSignableMessage,
    createTransactionMessage,
    generateKeyPairSigner,
    getBase58Decoder,
    MessagePartialSigner,
    partiallySignTransactionMessageWithSigners,
    pipe,
    setTransactionMessageFeePayerSigner,
    setTransactionMessageLifetimeUsingBlockhash,
    TransactionPartialSigner,
    TransactionSigner,
} from '@solana/web3.js';
import { getTransferSolInstruction } from '@solana-program/system';
import { readFile } from 'fs/promises';
import path from 'path';

const log = createLogger('Signers');

/**
 * SETUP: CREATE A NEW TRANSACTION MESSAGE
 * This helper function creates a new transaction message for us such that:
 * - Its lifetime is set to the latest blockhash.
 * - Its fee payer is set to the given signer.
 * - It contains a single instruction to transfer 1 SOL to some other address.
 *
 * You can read more about this transaction and how to send it
 * in the `examples/transfer-lamports` example.
 */
function getTransferSolTransactionMessage(signer: TransactionSigner) {
    // Create the transfer SOL instruction by passing the signer as the source.
    const instruction = getTransferSolInstruction({
        amount: 1n,
        destination: address('ED1WqT2hWJLSZtj4TtTdoovmpMrr7zpkUdbfxmcJR1Fq'),
        source: signer, // <- We pass the signer here, not just the address.
    });

    // Use a mock blockhash as a transaction lifetime constraint.
    const mockBlockhash = {
        blockhash: '9fBfi7Q23LHd6gDENDhp25jRnzeGJZesAtCkKuqkga63' as Blockhash,
        lastValidBlockHeight: 1119n,
    };

    // Prepare the transaction message.
    return pipe(
        createTransactionMessage({ version: 0 }),
        tx => setTransactionMessageLifetimeUsingBlockhash(mockBlockhash, tx),
        tx => setTransactionMessageFeePayerSigner(signer, tx), // <- Here as well, we provide the payer as a signer.
        tx => appendTransactionMessageInstruction(instruction, tx),
    );
}

/**
 * SETUP: SIGN A MESSAGE
 * This helper function signs a message using the given signer.
 */
async function signMessage(signer: MessagePartialSigner, message: string) {
    const [signatureDictionary] = await signer.signMessages([createSignableMessage(message)]);
    const signature = signatureDictionary[signer.address];
    log.info(
        { signature: signature ? getBase58Decoder().decode(signature) : null },
        `>>  Signing the message "${message}"`,
    );
}

/**
 * SETUP: SIGN A TRANSACTION
 * This helper function signs a transaction message using the given signer.
 */
async function signTransaction(signer: TransactionPartialSigner, transactionMessage: CompilableTransactionMessage) {
    const transaction = compileTransaction(transactionMessage);
    const [signatureDictionary] = await signer.signTransactions([transaction]);
    const signature = signatureDictionary[signer.address];
    log.info(
        { signature: signature ? getBase58Decoder().decode(signature) : null },
        '>>  Signing a transfer SOL transaction',
    );
}

/**
 * SETUP: SIGN A TRANSACTION USING REGISTERED SIGNERS
 * This helper function signs a transaction message by retrieving
 * the signers registered within the transaction message.
 * For instance, in our transfer SOL transaction message, we can
 * extract the fee payer and the transfer source as signers.
 */
async function signTransactionWithSigners(transactionMessage: CompilableTransactionMessage) {
    const signedTransaction = await partiallySignTransactionMessageWithSigners(transactionMessage);
    const signature = signedTransaction.signatures[transactionMessage.feePayer];
    log.info(
        { signature: signature ? getBase58Decoder().decode(signature) : null },
        '>>  Signing a transfer SOL transaction using its registered signers',
    );
}

/**
 * OPTION 1: GENERATED KEY PAIR SIGNER
 * With this option, we generate a brand new key pair
 * and wrap it in a signer object.
 */
{
    // Generate a new key pair signer.
    const signer = await generateKeyPairSigner();
    log.info({ address: signer.address }, '[option 1] Using a generated key pair signer');

    // Use it to sign messages and transactions.
    const transactionMessage = getTransferSolTransactionMessage(signer);
    await signMessage(signer, 'Hello, World!');
    await signTransaction(signer, transactionMessage);
    await signTransactionWithSigners(transactionMessage);
}

/**
 * OPTION 2: KEY PAIR SIGNER FROM FILE
 * With this option, we load the content of the key pair
 * from a JSON file and wrap it in a signer object.
 */
{
    // Load a key pair signer from a JSON file.
    const keypairPath = path.join('src', 'example-keypair.json');
    const keypairBytes = new Uint8Array(JSON.parse(await readFile(keypairPath, 'utf-8')));
    const signer = await createKeyPairSignerFromBytes(keypairBytes);
    log.info({ address: signer.address }, '[option 2] Using a key pair signer from a JSON file');

    // Use it to sign messages and transactions.
    const transactionMessage = getTransferSolTransactionMessage(signer);
    await signMessage(signer, 'Hello, World!');
    await signTransaction(signer, transactionMessage);
    await signTransactionWithSigners(transactionMessage);
}

/**
 * OPTION 3: KEY PAIR SIGNER FROM SEED
 * With this option, we derive a key pair from a seed —
 * i.e. the 32 bytes of its private key — and wrap it
 * in a signer object.
 */
{
    // Access the 32 bytes of the private key.
    // Note that this is the first 32 bytes of the `example-keypair.json` file,
    // Meaning we will get the same signatures as in the previous example.
    const seed = new Uint8Array([
        107, 145, 66, 123, 253, 251, 77, 186, 176, 211, 187, 232, 47, 142, 54, 214, 142, 152, 37, 182, 65, 117, 85, 75,
        133, 97, 107, 11, 180, 24, 73, 245,
    ]);

    // Create a key pair signer using this private key seed.
    const signer = await createKeyPairSignerFromPrivateKeyBytes(seed);
    log.info({ address: signer.address }, '[option 3] Using a key pair signer from a seed');

    // Use it to sign messages and transactions.
    const transactionMessage = getTransferSolTransactionMessage(signer);
    await signMessage(signer, 'Hello, World!');
    await signTransaction(signer, transactionMessage);
    await signTransactionWithSigners(transactionMessage);
}

/**
 * OPTION 4: NOOP SIGNER
 * With this option, we create a no-operation signer that pretends
 * sign messages and transactions without actually doing so.
 * This can be useful when a function requires a signer object but
 * we don't actually want to sign anything at this point.
 * For instance, we can use it to create a transaction with a
 * server-side fee payer that will be signed by the server later on.
 */
{
    // Create a no-op signer.
    const signer = createNoopSigner(address('BoK4mWeYVU6LdgNfo8QF7zxmTRiHw7VKMhodToZgrRup'));
    log.info({ address: signer.address }, '[option 4] Using a no-op signer');

    // Use it to sign messages and transactions.
    const transactionMessage = getTransferSolTransactionMessage(signer);
    await signMessage(signer, 'Hello, World!');
    await signTransaction(signer, transactionMessage);
    await signTransactionWithSigners(transactionMessage);
}
