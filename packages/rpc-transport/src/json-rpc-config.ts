import { IRpcApi, IRpcSubscriptionsApi } from '@solana/rpc-types';

import { IRpcTransport, IRpcTransportWithCluster, IRpcWebSocketTransport } from './transports/transport-types';

export type RpcConfig<TRpcMethods> = Readonly<{
    api: IRpcApi<TRpcMethods>;
    transport: IRpcTransport | IRpcTransportWithCluster;
}>;

export type RpcSubscriptionConfig<TRpcMethods> = Readonly<{
    api: IRpcSubscriptionsApi<TRpcMethods>;
    transport: IRpcWebSocketTransport;
}>;
