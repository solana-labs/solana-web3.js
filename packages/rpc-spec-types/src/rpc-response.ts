import { RpcErrorResponse } from './rpc-error';

interface IHasIdentifier {
    readonly id: number;
}

export type RpcResponse<TResponse> = IHasIdentifier & Readonly<{ result: TResponse } | { error: RpcErrorResponse }>;
