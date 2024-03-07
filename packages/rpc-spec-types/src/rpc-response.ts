import { RpcErrorResponse } from './rpc-error';

interface IHasIdentifier {
    readonly id: number;
}

export type RpcResponse<TResponse> = IHasIdentifier & Readonly<{ error: RpcErrorResponse } | { result: TResponse }>;
