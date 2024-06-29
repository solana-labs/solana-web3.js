import { SOLANA_ERROR__SIGNER__TRANSACTION_SENDING_SIGNER_MISSING, SolanaError } from '@solana/errors';
import { SignatureBytes } from '@solana/keys';
import {
    CompilableTransactionMessage,
    TransactionMessageWithBlockhashLifetime,
    TransactionMessageWithDurableNonceLifetime,
} from '@solana/transaction-messages';
import {
    assertTransactionIsFullySigned,
    compileTransaction,
    FullySignedTransaction,
    Transaction,
    TransactionWithBlockhashLifetime,
    TransactionWithDurableNonceLifetime,
    TransactionWithLifetime,
} from '@solana/transactions';

import { getSignersFromTransactionMessage, ITransactionMessageWithSigners } from './account-signer-meta';
import { deduplicateSigners } from './deduplicate-signers';
import {
    isTransactionModifyingSigner,
    TransactionModifyingSigner,
    TransactionModifyingSignerConfig,
} from './transaction-modifying-signer';
import {
    isTransactionPartialSigner,
    TransactionPartialSigner,
    TransactionPartialSignerConfig,
} from './transaction-partial-signer';
import {
    isTransactionSendingSigner,
    TransactionSendingSigner,
    TransactionSendingSignerConfig,
} from './transaction-sending-signer';
import { isTransactionSigner, TransactionSigner } from './transaction-signer';
import { assertIsTransactionMessageWithSingleSendingSigner } from './transaction-with-single-sending-signer';

type CompilableTransactionMessageWithSigners = CompilableTransactionMessage & ITransactionMessageWithSigners;

/**
 * Signs a transaction using any signers that may be stored in IAccountSignerMeta instruction accounts
 * as well as any signers provided explicitly to this function.
 * It will ignore TransactionSendingSigners since this function does not send the transaction.
 */
export async function partiallySignTransactionMessageWithSigners<
    TTransactionMessage extends CompilableTransactionMessageWithSigners &
        TransactionMessageWithBlockhashLifetime = CompilableTransactionMessageWithSigners &
        TransactionMessageWithBlockhashLifetime,
>(
    transactionMessage: TTransactionMessage,
    config?: TransactionPartialSignerConfig,
): Promise<Transaction & TransactionWithBlockhashLifetime>;

export async function partiallySignTransactionMessageWithSigners<
    TTransactionMessage extends CompilableTransactionMessageWithSigners &
        TransactionMessageWithDurableNonceLifetime = CompilableTransactionMessageWithSigners &
        TransactionMessageWithDurableNonceLifetime,
>(
    transactionMessage: TTransactionMessage,
    config?: TransactionPartialSignerConfig,
): Promise<Readonly<Transaction & TransactionWithDurableNonceLifetime>>;

export async function partiallySignTransactionMessageWithSigners<
    TTransactionMessage extends CompilableTransactionMessageWithSigners = CompilableTransactionMessageWithSigners,
>(
    transactionMessage: TTransactionMessage,
    config?: TransactionPartialSignerConfig,
): Promise<Readonly<Transaction & TransactionWithLifetime>>;

export async function partiallySignTransactionMessageWithSigners<
    TTransactionMessage extends CompilableTransactionMessageWithSigners = CompilableTransactionMessageWithSigners,
>(
    transactionMessage: TTransactionMessage,
    config?: TransactionPartialSignerConfig,
): Promise<Readonly<Transaction & TransactionWithLifetime>> {
    const { partialSigners, modifyingSigners } = categorizeTransactionSigners(
        deduplicateSigners(getSignersFromTransactionMessage(transactionMessage).filter(isTransactionSigner)),
        { identifySendingSigner: false },
    );

    return await signModifyingAndPartialTransactionSigners(
        transactionMessage,
        modifyingSigners,
        partialSigners,
        config,
    );
}

/**
 * Signs a transaction using any signers that may be stored in IAccountSignerMeta instruction accounts
 * as well as any signers provided explicitly to this function.
 * It will assert that the transaction is fully signed before returning.
 * It will ignore TransactionSendingSigners since this function does not send the transaction.
 */
export async function signTransactionMessageWithSigners<
    TTransactionMessage extends CompilableTransactionMessageWithSigners &
        TransactionMessageWithBlockhashLifetime = CompilableTransactionMessageWithSigners &
        TransactionMessageWithBlockhashLifetime,
>(
    transactionMessage: TTransactionMessage,
    config?: TransactionPartialSignerConfig,
): Promise<Readonly<FullySignedTransaction & TransactionWithBlockhashLifetime>>;

export async function signTransactionMessageWithSigners<
    TTransactionMessage extends CompilableTransactionMessageWithSigners &
        TransactionMessageWithDurableNonceLifetime = CompilableTransactionMessageWithSigners &
        TransactionMessageWithDurableNonceLifetime,
>(
    transactionMessage: TTransactionMessage,
    config?: TransactionPartialSignerConfig,
): Promise<Readonly<FullySignedTransaction & TransactionWithDurableNonceLifetime>>;

export async function signTransactionMessageWithSigners<
    TTransactionMessage extends CompilableTransactionMessageWithSigners = CompilableTransactionMessageWithSigners,
>(
    transactionMessage: TTransactionMessage,
    config?: TransactionPartialSignerConfig,
): Promise<Readonly<FullySignedTransaction & TransactionWithLifetime>>;

export async function signTransactionMessageWithSigners<
    TTransactionMessage extends CompilableTransactionMessageWithSigners = CompilableTransactionMessageWithSigners,
>(
    transactionMessage: TTransactionMessage,
    config?: TransactionPartialSignerConfig,
): Promise<Readonly<FullySignedTransaction & TransactionWithLifetime>> {
    const signedTransaction = await partiallySignTransactionMessageWithSigners(transactionMessage, config);
    assertTransactionIsFullySigned(signedTransaction);
    return signedTransaction;
}

/**
 * Signs and sends a transaction using any signers that may be stored in IAccountSignerMeta
 * instruction accounts as well as any signers provided explicitly to this function.
 * It will identify a single TransactionSendingSigners to use for sending the transaction, if any.
 * Otherwise, it will send the transaction using the provided fallbackSender.
 */
export async function signAndSendTransactionMessageWithSigners<
    TTransactionMessage extends CompilableTransactionMessageWithSigners = CompilableTransactionMessageWithSigners,
>(transaction: TTransactionMessage, config?: TransactionSendingSignerConfig): Promise<SignatureBytes> {
    assertIsTransactionMessageWithSingleSendingSigner(transaction);

    const abortSignal = config?.abortSignal;
    const { partialSigners, modifyingSigners, sendingSigner } = categorizeTransactionSigners(
        deduplicateSigners(getSignersFromTransactionMessage(transaction).filter(isTransactionSigner)),
    );

    abortSignal?.throwIfAborted();
    const signedTransaction = await signModifyingAndPartialTransactionSigners(
        transaction,
        modifyingSigners,
        partialSigners,
        config,
    );

    if (!sendingSigner) {
        throw new SolanaError(SOLANA_ERROR__SIGNER__TRANSACTION_SENDING_SIGNER_MISSING);
    }

    abortSignal?.throwIfAborted();
    const [signature] = await sendingSigner.signAndSendTransactions([signedTransaction], config);
    abortSignal?.throwIfAborted();

    return signature;
}

/**
 * Identifies each provided TransactionSigner and categorizes them into their respective types.
 * When a signer implements multiple interface, it will try to used to most powerful interface
 * but fallback to the least powerful interface when necessary.
 * For instance, if a signer implements TransactionSendingSigner and TransactionModifyingSigner,
 * it will be categorized as a TransactionSendingSigner if and only if no other signers implement
 * the TransactionSendingSigner interface.
 */
function categorizeTransactionSigners(
    signers: readonly TransactionSigner[],
    config: { identifySendingSigner?: boolean } = {},
): Readonly<{
    modifyingSigners: readonly TransactionModifyingSigner[];
    partialSigners: readonly TransactionPartialSigner[];
    sendingSigner: TransactionSendingSigner | null;
}> {
    // Identify the unique sending signer that should be used.
    const identifySendingSigner = config.identifySendingSigner ?? true;
    const sendingSigner = identifySendingSigner ? identifyTransactionSendingSigner(signers) : null;

    // Now, focus on the other signers.
    // I.e. the modifying or partial signers that are not the identified sending signer.
    // Note that any other sending only signers will be discarded.
    const otherSigners = signers.filter(
        (signer): signer is TransactionModifyingSigner | TransactionPartialSigner =>
            signer !== sendingSigner && (isTransactionModifyingSigner(signer) || isTransactionPartialSigner(signer)),
    );

    // Identify the modifying signers from the other signers.
    const modifyingSigners = identifyTransactionModifyingSigners(otherSigners);

    // Use any remaining signers as partial signers.
    const partialSigners = otherSigners
        .filter(isTransactionPartialSigner)
        .filter(signer => !(modifyingSigners as typeof otherSigners).includes(signer));

    return Object.freeze({ modifyingSigners, partialSigners, sendingSigner });
}

/** Identifies the best signer to use as a TransactionSendingSigner, if any */
function identifyTransactionSendingSigner(signers: readonly TransactionSigner[]): TransactionSendingSigner | null {
    // Ensure there are any TransactionSendingSigners in the first place.
    const sendingSigners = signers.filter(isTransactionSendingSigner);
    if (sendingSigners.length === 0) return null;

    // Prefer sending signers that do not offer other interfaces.
    const sendingOnlySigners = sendingSigners.filter(
        signer => !isTransactionModifyingSigner(signer) && !isTransactionPartialSigner(signer),
    );
    if (sendingOnlySigners.length > 0) {
        return sendingOnlySigners[0];
    }

    // Otherwise, choose any sending signer.
    return sendingSigners[0];
}

/** Identifies the best signers to use as TransactionModifyingSigners, if any */
function identifyTransactionModifyingSigners(
    signers: readonly (TransactionModifyingSigner | TransactionPartialSigner)[],
): readonly TransactionModifyingSigner[] {
    // Ensure there are any TransactionModifyingSigner in the first place.
    const modifyingSigners = signers.filter(isTransactionModifyingSigner);
    if (modifyingSigners.length === 0) return [];

    // Prefer modifying signers that do not offer partial signing.
    const nonPartialSigners = modifyingSigners.filter(signer => !isTransactionPartialSigner(signer));
    if (nonPartialSigners.length > 0) return nonPartialSigners;

    // Otherwise, choose only one modifying signer (whichever).
    return [modifyingSigners[0]];
}

/**
 * Signs a transaction using the provided TransactionModifyingSigners
 * sequentially followed by the TransactionPartialSigners in parallel.
 */
async function signModifyingAndPartialTransactionSigners<
    TTransactionMessage extends CompilableTransactionMessageWithSigners = CompilableTransactionMessageWithSigners,
>(
    transactionMessage: TTransactionMessage,
    modifyingSigners: readonly TransactionModifyingSigner[] = [],
    partialSigners: readonly TransactionPartialSigner[] = [],
    config?: TransactionModifyingSignerConfig,
): Promise<Readonly<Transaction & TransactionWithLifetime>> {
    // serialize the transaction
    const transaction = compileTransaction(transactionMessage);

    // Handle modifying signers sequentially.
    const modifiedTransaction = await modifyingSigners.reduce(
        async (transaction, modifyingSigner) => {
            config?.abortSignal?.throwIfAborted();
            const [tx] = await modifyingSigner.modifyAndSignTransactions([await transaction], config);
            return Object.freeze(tx);
        },
        Promise.resolve(transaction) as Promise<Readonly<Transaction & TransactionWithLifetime>>,
    );

    // Handle partial signers in parallel.
    config?.abortSignal?.throwIfAborted();
    const signatureDictionaries = await Promise.all(
        partialSigners.map(async partialSigner => {
            const [signatures] = await partialSigner.signTransactions([modifiedTransaction], config);
            return signatures;
        }),
    );
    const signedTransaction: Readonly<Transaction & TransactionWithLifetime> = {
        ...modifiedTransaction,
        signatures: Object.freeze(
            signatureDictionaries.reduce((signatures, signatureDictionary) => {
                return { ...signatures, ...signatureDictionary };
            }, modifiedTransaction.signatures ?? {}),
        ),
    };

    return Object.freeze(signedTransaction);
}
