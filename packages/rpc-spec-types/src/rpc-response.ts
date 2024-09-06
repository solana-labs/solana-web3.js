interface IHasIdentifier {
    readonly id: number;
}

type RpcErrorResponsePayload = Readonly<{
    code: number;
    data?: unknown;
    message: string;
}>;

export type RpcResponseData<TResponse> = IHasIdentifier &
    Readonly<{ error: RpcErrorResponsePayload } | { result: TResponse }>;
