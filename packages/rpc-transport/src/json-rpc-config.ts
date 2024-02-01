import { IRpcApi, IRpcSubscriptionsApi, IRpcTransport } from '@solana/rpc-types';

import { IRpcWebSocketTransport } from './transports/transport-types';

export type RpcConfig<TRpcMethods> = Readonly<{
    api: IRpcApi<TRpcMethods>;
    transport: IRpcTransport;
}>;

export type RpcSubscriptionConfig<TRpcMethods> = Readonly<{
    api: IRpcSubscriptionsApi<TRpcMethods>;
    transport: IRpcWebSocketTransport;
}>;
