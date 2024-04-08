import type { RpcSubscriptions, RpcSubscriptionsTransport } from '@solana/rpc-subscriptions-spec';
import type { ClusterUrl, DevnetUrl, MainnetUrl, TestnetUrl } from '@solana/rpc-types';

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
