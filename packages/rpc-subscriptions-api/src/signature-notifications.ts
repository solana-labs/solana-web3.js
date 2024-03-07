import type { Signature } from '@solana/keys';
import type { RpcSubscriptionsApiMethods } from '@solana/rpc-subscriptions-spec';
import type { Commitment, SolanaRpcResponse, TransactionError } from '@solana/rpc-types';

type SignatureNotificationsApiNotificationReceived = SolanaRpcResponse<Readonly<string>>;

type SignatureNotificationsApiNotificationProcessed = SolanaRpcResponse<
    Readonly<{
        // Error if transaction failed, null if transaction succeeded.
        err: TransactionError | null;
    }>
>;

type SignatureNotificationsApiConfigBase = Readonly<{
    commitment?: Commitment;
}>;

export interface SignatureNotificationsApi extends RpcSubscriptionsApiMethods {
    /**
     * Subscribe to a transaction signature to receive notification when a given transaction is committed.
     * On `signatureNotification` - the subscription is automatically cancelled.
     * The signature must be a txid, the first signature of a transaction.
     */
    signatureNotifications(
        // Transaction Signature, as base-58 encoded string
        signature: Signature,
        config: Readonly<{
            // Whether or not to subscribe for notifications when signatures are received
            // by the RPC, in addition to when they are processed.
            enableReceivedNotification: true;
        }> &
            SignatureNotificationsApiConfigBase,
    ): SignatureNotificationsApiNotificationProcessed | SignatureNotificationsApiNotificationReceived;
    signatureNotifications(
        signature: Signature,
        config?: Readonly<{
            enableReceivedNotification?: false;
        }> &
            SignatureNotificationsApiConfigBase,
    ): SignatureNotificationsApiNotificationProcessed;
}
