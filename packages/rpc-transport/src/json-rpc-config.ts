import { IRpcApi, IRpcSubscriptionsApi } from '@solana/rpc-types';

import { IRpcTransport, IRpcWebSocketTransport } from './transports/transport-types';

export type RpcConfig<TRpcMethods> = Readonly<{
    api: IRpcApi<TRpcMethods>;
    transport: IRpcTransport;
}>;

export type RpcSubscriptionConfig<TRpcMethods> = Readonly<{
    api: IRpcSubscriptionsApi<TRpcMethods>;
    transport: IRpcWebSocketTransport;
}>;
