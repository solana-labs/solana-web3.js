import { Commitment, RpcResponse } from '../rpc-methods/common';
import { TransactionError } from '../transaction-error';
import { TransactionSignature } from '../transaction-signature';

type SignatureNotificationsApiNotification = RpcResponse<
    Readonly<{
        // Error if transaction failed, null if transaction succeeded.
        err: TransactionError | null;
    }>
>;

type SignatureNotificationsApiConfig = Readonly<{
    commitment?: Commitment;
}>;

export interface SignatureNotificationsApi {
    /**
     * Subscribe to a transaction signature to receive notification when a given transaction is committed.
     * On `signatureNotification` - the subscription is automatically cancelled.
     * The signature must be a txid, the first signature of a transaction.
     */
    signatureNotifications(
        // Transaction Signature, as base-58 encoded string
        signature: TransactionSignature,
        config?: SignatureNotificationsApiConfig
    ): SignatureNotificationsApiNotification;
}
