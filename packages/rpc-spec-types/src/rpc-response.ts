import type { RpcRequest } from './rpc-request';

export type RpcResponse<TResponse = unknown> = TResponse;

export type RpcResponseTransformer<TResponse = unknown> = {
    (response: RpcResponse, request: RpcRequest): RpcResponse<TResponse>;
};

interface IHasIdentifier {
    readonly id: string;
}

type RpcErrorResponsePayload = Readonly<{
    code: number;
    data?: unknown;
    message: string;
}>;

export type RpcResponseData<TResponse> = IHasIdentifier &
    Readonly<{ error: RpcErrorResponsePayload } | { result: TResponse }>;
