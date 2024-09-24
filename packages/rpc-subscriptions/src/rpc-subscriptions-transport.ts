import { RpcSubscriptionsChannelCreator, RpcSubscriptionsTransport } from '@solana/rpc-subscriptions-spec';
import { ClusterUrl } from '@solana/rpc-types';

import {
    RpcSubscriptionsChannelCreatorFromClusterUrl,
    RpcSubscriptionsTransportFromClusterUrl,
} from './rpc-subscriptions-clusters';

export type DefaultRpcSubscriptionsTransportConfig<TClusterUrl extends ClusterUrl> = Readonly<{
    createChannel: RpcSubscriptionsChannelCreatorFromClusterUrl<TClusterUrl, unknown, unknown>;
}>;

export function createDefaultRpcSubscriptionsTransport<TClusterUrl extends ClusterUrl>({
    createChannel,
}: DefaultRpcSubscriptionsTransportConfig<TClusterUrl>): RpcSubscriptionsTransportFromClusterUrl<TClusterUrl> {
    return createRpcSubscriptionsTransportFromChannelCreator(
        createChannel,
    ) as RpcSubscriptionsTransportFromClusterUrl<TClusterUrl>;
}

export function createRpcSubscriptionsTransportFromChannelCreator<
    TChannelCreator extends RpcSubscriptionsChannelCreator<unknown, unknown>,
>(createChannel: TChannelCreator): RpcSubscriptionsTransport {
    return async ({ executeSubscriptionPlan, signal }) => {
        const channel = await createChannel({ abortSignal: signal });
        return await executeSubscriptionPlan({ channel, signal });
    };
}
