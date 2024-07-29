/**
 * EXAMPLE
 * Transfer Lamports from one account to another with @solana/web3.js.
 *
 * Before running any of the examples in this monorepo, make sure to set up a test validator by
 * running `pnpm test:live-with-test-validator:setup` in the root directory.
 *
 * To run this example, execute `pnpm start` in this directory.
 */
import { createLogger } from '@solana/example-utils/createLogger.js';
import pressAnyKeyPrompt from '@solana/example-utils/pressAnyKeyPrompt.js';
import {
    address,
    appendTransactionMessageInstruction,
    createKeyPairSignerFromBytes,
    createSolanaRpc,
    createSolanaRpcSubscriptions,
    createTransactionMessage,
    getSignatureFromTransaction,
    isSolanaError,
    lamports,
    pipe,
    sendAndConfirmTransactionFactory,
    setTransactionMessageFeePayer,
    setTransactionMessageLifetimeUsingBlockhash,
    signTransactionMessageWithSigners,
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_SEND_TRANSACTION_PREFLIGHT_FAILURE,
} from '@solana/web3.js';
import { getSystemErrorMessage, getTransferSolInstruction, isSystemError } from '@solana-program/system';

const log = createLogger('Transfer');

/**
 * SETUP: SOURCE ACCOUNT
 * The account from which the tokens will be transferred needs to sign the transaction. We need to
 * create a `TransactionSigner` for it. You can find the account this key relates to in the test
 * validator fixtures in `/scripts/fixtures/example-transfer-sol-source-account.json`
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

/**
 * SETUP: DESTINATION ACCOUNT
 * Since the account to which the tokens will be transferred does not need to sign the transaction
 * to receive them, we only need an address.
 */
const DESTINATION_ACCOUNT_ADDRESS = address('GdG9JHTSWBChvf6dfBATEYCZbDwKtcC6tJEpqoyuVfqV');
log.info({ address: DESTINATION_ACCOUNT_ADDRESS }, '[setup] Setting destination account address');

/**
 * SETUP: RPC CONNECTION
 * When it comes time to send our transaction to the Solana network for execution, we will do so
 * through a remote procedure call (RPC) server. This example uses your local test validator which
 * must be running before you run this script.
 */
const rpc = createSolanaRpc('http://127.0.0.1:8899');
const rpcSubscriptions = createSolanaRpcSubscriptions('ws://127.0.0.1:8900');

/**
 * SETUP: TRANSACTION SENDER
 * We use the RPC connection that you just created to build a reusable transaction sender.
 */
const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
    /**
     * The RPC implements a `sendTransaction` method which relays transactions to the network.
     */
    rpc,
    /**
     * RPC subscriptions allow the transaction sender to subscribe to the status of our transaction.
     * The sender will resolve when the transaction is reported to have been confirmed, or will
     * reject in the event of an error, or a timeout if the transaction lifetime is thought to have
     * expired.
     */
    rpcSubscriptions,
});

/**
 * SETUP: TRANSACTION LIFETIME
 * Every transaction needs to specify a valid lifetime for it to be accepted for execution on the
 * network. For this transaction, we will fetch the latest block's hash as proof that this
 * transaction was prepared close in time to when we tried to execute it. The network will accept
 * transactions which include this hash until it progresses past the block specified as
 * `latestBlockhash.lastValidBlockHeight`.
 *
 * TIP: It is desirable for your program to fetch this block hash as late as possible before signing
 * and sending the transaction so as to ensure that it's as 'fresh' as possible.
 */
log.info("[setup] Fetching a blockhash for use as the transaction's lifetime constraint");
const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
log.info(latestBlockhash, '[setup] Got a blockhash');

/**
 * STEP 1: CREATE THE TRANSFER TRANSACTION
 */
const transactionMessage = pipe(
    (log.info('[step 1] Creating a transaction message'), createTransactionMessage({ version: 0 })),
    /**
     * Every transaction must state from which account the transaction fee should be debited from,
     * and that account must sign the transaction. Here, we'll make the source account pay the fee.
     */
    tx => (
        log.info({ address: SOURCE_ACCOUNT_SIGNER.address }, '[step 1] Setting the fee payer'),
        setTransactionMessageFeePayer(SOURCE_ACCOUNT_SIGNER.address, tx)
    ),
    /**
     * A transaction is valid for execution as long as it includes a valid lifetime constraint. Here
     * we supply the hash of a recent block. The network will accept this transaction until it
     * considers that hash to be 'expired' for the purpose of transaction execution.
     */
    tx => (
        log.info(latestBlockhash, '[step 1] Setting the transaction lifetime'),
        setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx)
    ),
    /**
     * Every transaction needs at least one instruction. This instruction describes the transfer.
     */
    tx =>
        appendTransactionMessageInstruction(
            /**
             * The system program has the exclusive right to transfer Lamports from one account to
             * another. Here we use an instruction creator from the `@solana-program/system` package
             * to create a transfer instruction for the system program.
             */
            (log.info(
                '[step 1] Creating an instruction to transfer Lamports from',
                SOURCE_ACCOUNT_SIGNER.address,
                'to',
                DESTINATION_ACCOUNT_ADDRESS,
            ),
            getTransferSolInstruction({
                amount: lamports(1_000_000n),
                destination: DESTINATION_ACCOUNT_ADDRESS,
                /**
                 * By supplying a `TransactionSigner` here instead of just an address, you give this
                 * transaction message superpowers. Later in this example, the
                 * `signTransactionMessageWithSigners` method, in consideration of the fact that the
                 * source account must sign System program transfer instructions, will use this
                 * `TransactionSigner` to produce a transaction signed on behalf of
                 * `SOURCE_ACCOUNT_SIGNER.address`, without any further configuration.
                 */
                source: SOURCE_ACCOUNT_SIGNER,
            })),
            tx,
        ),
);

/**
 * STEP 2: SIGN THE TRANSACTION
 * In order to prove that the owner of the account from which the tokens are being transferred
 * approves of the transfer itself, the transaction will need to include a cryptographic signature
 * that only the owner of that account could produce. We have already loaded the account owner's
 * key pair above, so we can sign the transaction now.
 */
log.info('[step 2] Signing the transaction');
const signedTransaction = await signTransactionMessageWithSigners(transactionMessage);
log.info({ signature: getSignatureFromTransaction(signedTransaction) }, '[step 2] Transaction signed');

/**
 * STEP 3: SEND AND CONFIRM THE TRANSACTION
 * Now that the transaction is signed, we send it to an RPC. The RPC will relay it to the Solana
 * network for execution. The `sendAndConfirmTransaction` method will resolve when the transaction
 * is reported to have been confirmed. It will reject in the event of an error (eg. a failure to
 * simulate the transaction), or may timeout if the transaction lifetime is thought to have expired
 * (eg. the network has progressed past the `lastValidBlockHeight` of the transaction's blockhash
 * lifetime constraint).
 */
log.info(
    '[step 3] Sending transaction: https://explorer.solana.com/tx/%s?cluster=custom&customUrl=127.0.0.1:8899',
    getSignatureFromTransaction(signedTransaction),
);
log.warn(
    '[step 3] The URL above does not work on Brave or Safari because they block localhost ' +
        'connections. Use Chrome.',
);
try {
    await sendAndConfirmTransaction(signedTransaction, { commitment: 'confirmed' });
    log.info('[success] Transfer confirmed');
    await pressAnyKeyPrompt('Press any key to quit');
} catch (e) {
    if (isSolanaError(e, SOLANA_ERROR__JSON_RPC__SERVER_ERROR_SEND_TRANSACTION_PREFLIGHT_FAILURE)) {
        const preflightErrorContext = e.context;
        const preflightErrorMessage = e.message;
        const errorDetailMessage = isSystemError(e.cause, transactionMessage)
            ? getSystemErrorMessage(e.cause.context.code)
            : e.cause?.message;
        log.error(preflightErrorContext, '%s: %s', preflightErrorMessage, errorDetailMessage);
    } else {
        throw e;
    }
}
