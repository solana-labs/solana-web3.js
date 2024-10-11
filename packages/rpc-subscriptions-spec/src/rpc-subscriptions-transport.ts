import { SolanaError } from '@solana/errors';
import { DataPublisher } from '@solana/subscribable';

import { RpcSubscriptionsPlan } from './rpc-subscriptions-api';

export type RpcSubscriptionsTransportDataEvents<TNotification> = {
    error: SolanaError;
    notification: TNotification;
};

interface RpcSubscriptionsTransportConfig<TNotification> extends RpcSubscriptionsPlan<TNotification> {
    signal: AbortSignal;
}

export interface RpcSubscriptionsTransport {
    <TNotification>(
        config: RpcSubscriptionsTransportConfig<TNotification>,
    ): Promise<DataPublisher<RpcSubscriptionsTransportDataEvents<TNotification>>>;
}
