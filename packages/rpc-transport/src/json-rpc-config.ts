import { IIRpcTransport, IRpcApi, IRpcSubscriptionsApi, IRpcWebSocketTransport } from '@solana/rpc-types';

export type RpcConfig<TRpcMethods> = Readonly<{
    api: IRpcApi<TRpcMethods>;
    transport: IIRpcTransport;
}>;

export type RpcSubscriptionConfig<TRpcMethods> = Readonly<{
    api: IRpcSubscriptionsApi<TRpcMethods>;
    transport: IRpcWebSocketTransport;
}>;
