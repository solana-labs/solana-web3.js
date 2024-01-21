import { IIRpcTransport, IRpcApi, IRpcSubscriptionsApi } from '@solana/rpc-types';

import { IRpcWebSocketTransport } from './transports/transport-types';

export type RpcConfig<TRpcMethods> = Readonly<{
    api: IRpcApi<TRpcMethods>;
    transport: IIRpcTransport;
}>;

export type RpcSubscriptionConfig<TRpcMethods> = Readonly<{
    api: IRpcSubscriptionsApi<TRpcMethods>;
    transport: IRpcWebSocketTransport;
}>;
