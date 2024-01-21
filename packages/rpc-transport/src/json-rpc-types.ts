import { Rpc, RpcSubscriptions } from '@solana/rpc-types';

import {
    IRpcTransport,
    IRpcTransportDevnet,
    IRpcTransportMainnet,
    IRpcTransportTestnet,
    IRpcTransportWithCluster,
    IRpcWebSocketTransport,
    IRpcWebSocketTransportDevnet,
    IRpcWebSocketTransportMainnet,
    IRpcWebSocketTransportTestnet,
    IRpcWebSocketTransportWithCluster,
} from './transports/transport-types';

export type RpcDevnet<TRpcMethods> = Rpc<TRpcMethods> & { '~cluster': 'devnet' };
export type RpcTestnet<TRpcMethods> = Rpc<TRpcMethods> & { '~cluster': 'testnet' };
export type RpcMainnet<TRpcMethods> = Rpc<TRpcMethods> & { '~cluster': 'mainnet' };
export type RpcFromTransport<
    TRpcMethods,
    TRpcTransport extends IRpcTransport | IRpcTransportWithCluster,
> = TRpcTransport extends IRpcTransportDevnet
    ? RpcDevnet<TRpcMethods>
    : TRpcTransport extends IRpcTransportTestnet
      ? RpcTestnet<TRpcMethods>
      : TRpcTransport extends IRpcTransportMainnet
        ? RpcMainnet<TRpcMethods>
        : Rpc<TRpcMethods>;

export type RpcSubscriptionsDevnet<TRpcSubscriptionMethods> = RpcSubscriptions<TRpcSubscriptionMethods> & {
    '~cluster': 'devnet';
};
export type RpcSubscriptionsTestnet<TRpcSubscriptionMethods> = RpcSubscriptions<TRpcSubscriptionMethods> & {
    '~cluster': 'testnet';
};
export type RpcSubscriptionsMainnet<TRpcSubscriptionMethods> = RpcSubscriptions<TRpcSubscriptionMethods> & {
    '~cluster': 'mainnet';
};
export type RpcSubscriptionsFromTransport<
    TRpcSubscriptionMethods,
    TRpcTransport extends IRpcWebSocketTransport | IRpcWebSocketTransportWithCluster,
> = TRpcTransport extends IRpcWebSocketTransportDevnet
    ? RpcSubscriptionsDevnet<TRpcSubscriptionMethods>
    : TRpcTransport extends IRpcWebSocketTransportTestnet
      ? RpcSubscriptionsTestnet<TRpcSubscriptionMethods>
      : TRpcTransport extends IRpcWebSocketTransportMainnet
        ? RpcSubscriptionsMainnet<TRpcSubscriptionMethods>
        : RpcSubscriptions<TRpcSubscriptionMethods>;
