import type { Signature } from '@solana/keys';
import type { RpcApiMethods } from '@solana/rpc-spec';
import type { Commitment, Slot } from '@solana/rpc-types';
import type { Base64EncodedWireTransaction } from '@solana/transactions';

type SendTransactionConfig = Readonly<{
    maxRetries?: bigint;
    minContextSlot?: Slot;
    preflightCommitment?: Commitment;
    skipPreflight?: boolean;
}>;

type SendTransactionResponse = Signature;

export interface SendTransactionApi extends RpcApiMethods {
    /** @deprecated Set `encoding` to `'base64'` when calling this method */
    sendTransaction(
        base64EncodedWireTransaction: Base64EncodedWireTransaction,
        config?: SendTransactionConfig & { encoding?: 'base58' },
    ): SendTransactionResponse;
    /**
     * Submits a signed transaction to the cluster for processing.
     *
     * This method does not alter the transaction in any way; it relays the transaction created by
     * clients to the node as-is.
     *
     * If the node's rpc service receives the transaction, this method immediately succeeds, without
     * waiting for any confirmations. A successful response from this method does not guarantee the
     * transaction is processed or confirmed by the cluster.
     *
     * While the rpc service will reasonably retry to submit it, the transaction could be rejected
     * if transaction's `recent_blockhash` expires before it lands.
     *
     * Use `getSignatureStatuses` to ensure a transaction is processed and confirmed.
     *
     * Before submitting, the following preflight checks are performed:
     *
     *     1. The transaction signatures are verified
     *     2. The transaction is simulated against the bank slot specified by the preflight
     *        commitment. On failure an error will be returned. Preflight checks may be disabled if
     *        desired. It is recommended to specify the same commitment and preflight commitment to
     *        avoid confusing behavior.
     *
     * The returned signature is the first signature in the transaction, which is used to identify
     * the transaction. This identifier can be easily extracted from the transaction data before
     * submission.
     */
    sendTransaction(
        base64EncodedWireTransaction: Base64EncodedWireTransaction,
        config?: SendTransactionConfig & { encoding: 'base64' },
    ): SendTransactionResponse;
}
