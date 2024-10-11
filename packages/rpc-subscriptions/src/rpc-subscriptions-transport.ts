import { pipe } from '@solana/functional';
import { RpcSubscriptionsChannelCreator, RpcSubscriptionsTransport } from '@solana/rpc-subscriptions-spec';
import { ClusterUrl } from '@solana/rpc-types';

import {
    RpcSubscriptionsChannelCreatorDevnet,
    RpcSubscriptionsChannelCreatorFromClusterUrl,
    RpcSubscriptionsChannelCreatorMainnet,
    RpcSubscriptionsChannelCreatorTestnet,
    RpcSubscriptionsTransportDevnet,
    RpcSubscriptionsTransportFromClusterUrl,
    RpcSubscriptionsTransportMainnet,
    RpcSubscriptionsTransportTestnet,
} from './rpc-subscriptions-clusters';
import { getRpcSubscriptionsTransportWithSubscriptionCoalescing } from './rpc-subscriptions-coalescer';

export type DefaultRpcSubscriptionsTransportConfig<TClusterUrl extends ClusterUrl> = Readonly<{
    createChannel: RpcSubscriptionsChannelCreatorFromClusterUrl<TClusterUrl, unknown, unknown>;
}>;

export function createDefaultRpcSubscriptionsTransport<TClusterUrl extends ClusterUrl>({
    createChannel,
}: DefaultRpcSubscriptionsTransportConfig<TClusterUrl>) {
    return pipe(
        createRpcSubscriptionsTransportFromChannelCreator(
            createChannel,
        ) as RpcSubscriptionsTransport as RpcSubscriptionsTransportFromClusterUrl<TClusterUrl>,
        transport => getRpcSubscriptionsTransportWithSubscriptionCoalescing(transport),
    );
}

export function createRpcSubscriptionsTransportFromChannelCreator<
    TChannelCreator extends RpcSubscriptionsChannelCreator<TOutboundMessage, TInboundMessage>,
    TInboundMessage,
    TOutboundMessage,
>(createChannel: TChannelCreator) {
    return (async ({ executeSubscriptionPlan, signal }) => {
        const channel = await createChannel({ abortSignal: signal });
        return await executeSubscriptionPlan({ channel, signal });
    }) as TChannelCreator extends RpcSubscriptionsChannelCreatorDevnet<TOutboundMessage, TInboundMessage>
        ? RpcSubscriptionsTransportDevnet
        : TChannelCreator extends RpcSubscriptionsChannelCreatorTestnet<TOutboundMessage, TInboundMessage>
          ? RpcSubscriptionsTransportTestnet
          : TChannelCreator extends RpcSubscriptionsChannelCreatorMainnet<TOutboundMessage, TInboundMessage>
            ? RpcSubscriptionsTransportMainnet
            : RpcSubscriptionsTransport;
}
