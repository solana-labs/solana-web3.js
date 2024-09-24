import type {
    RpcSubscriptions,
    RpcSubscriptionsChannelCreator,
    RpcSubscriptionsTransport,
} from '@solana/rpc-subscriptions-spec';
import type { ClusterUrl, DevnetUrl, MainnetUrl, TestnetUrl } from '@solana/rpc-types';

export type RpcSubscriptionsChannelCreatorDevnet<TOutboundMessage, TInboundMessage> = RpcSubscriptionsChannelCreator<
    TOutboundMessage,
    TInboundMessage
> & {
    '~cluster': 'devnet';
};
export type RpcSubscriptionsChannelCreatorTestnet<TOutboundMessage, TInboundMessage> = RpcSubscriptionsChannelCreator<
    TOutboundMessage,
    TInboundMessage
> & {
    '~cluster': 'testnet';
};
export type RpcSubscriptionsChannelCreatorMainnet<TOutboundMessage, TInboundMessage> = RpcSubscriptionsChannelCreator<
    TOutboundMessage,
    TInboundMessage
> & {
    '~cluster': 'mainnet';
};
export type RpcSubscriptionsChannelCreatorWithCluster<TOutboundMessage, TInboundMessage> =
    | RpcSubscriptionsChannelCreatorDevnet<TOutboundMessage, TInboundMessage>
    | RpcSubscriptionsChannelCreatorMainnet<TOutboundMessage, TInboundMessage>
    | RpcSubscriptionsChannelCreatorTestnet<TOutboundMessage, TInboundMessage>;
export type RpcSubscriptionsChannelCreatorFromClusterUrl<
    TClusterUrl extends ClusterUrl,
    TOutboundMessage,
    TInboundMessage,
> = TClusterUrl extends DevnetUrl
    ? RpcSubscriptionsChannelCreatorDevnet<TOutboundMessage, TInboundMessage>
    : TClusterUrl extends TestnetUrl
      ? RpcSubscriptionsChannelCreatorTestnet<TOutboundMessage, TInboundMessage>
      : TClusterUrl extends MainnetUrl
        ? RpcSubscriptionsChannelCreatorMainnet<TOutboundMessage, TInboundMessage>
        : RpcSubscriptionsChannelCreator<TOutboundMessage, TInboundMessage>;

export type RpcSubscriptionsTransportDevnet = RpcSubscriptionsTransport & { '~cluster': 'devnet' };
export type RpcSubscriptionsTransportTestnet = RpcSubscriptionsTransport & { '~cluster': 'testnet' };
export type RpcSubscriptionsTransportMainnet = RpcSubscriptionsTransport & { '~cluster': 'mainnet' };
export type RpcSubscriptionsTransportWithCluster =
    | RpcSubscriptionsTransportDevnet
    | RpcSubscriptionsTransportMainnet
    | RpcSubscriptionsTransportTestnet;
export type RpcSubscriptionsTransportFromClusterUrl<TClusterUrl extends ClusterUrl> = TClusterUrl extends DevnetUrl
    ? RpcSubscriptionsTransportDevnet
    : TClusterUrl extends TestnetUrl
      ? RpcSubscriptionsTransportTestnet
      : TClusterUrl extends MainnetUrl
        ? RpcSubscriptionsTransportMainnet
        : RpcSubscriptionsTransport;

export type RpcSubscriptionsDevnet<TRpcMethods> = RpcSubscriptions<TRpcMethods> & { '~cluster': 'devnet' };
export type RpcSubscriptionsTestnet<TRpcMethods> = RpcSubscriptions<TRpcMethods> & { '~cluster': 'testnet' };
export type RpcSubscriptionsMainnet<TRpcMethods> = RpcSubscriptions<TRpcMethods> & { '~cluster': 'mainnet' };
export type RpcSubscriptionsFromTransport<
    TRpcMethods,
    TRpcSubscriptionsTransport extends RpcSubscriptionsTransport,
> = TRpcSubscriptionsTransport extends RpcSubscriptionsTransportDevnet
    ? RpcSubscriptionsDevnet<TRpcMethods>
    : TRpcSubscriptionsTransport extends RpcSubscriptionsTransportTestnet
      ? RpcSubscriptionsTestnet<TRpcMethods>
      : TRpcSubscriptionsTransport extends RpcSubscriptionsTransportMainnet
        ? RpcSubscriptionsMainnet<TRpcMethods>
        : RpcSubscriptions<TRpcMethods>;
