interface IHasIdentifier {
    readonly id: number;
}

type RpcErrorResponse = Readonly<{
    code: number;
    data?: unknown;
    message: string;
}>;

export type RpcResponse<TResponse> = IHasIdentifier & Readonly<{ error: RpcErrorResponse } | { result: TResponse }>;
