export type RpcErrorResponse = Readonly<{
    code: number;
    data?: unknown;
    message: string;
}>;

export class RpcError extends Error {
    readonly code: number;
    readonly data: unknown;
    constructor(details: RpcErrorResponse) {
        super(`JSON-RPC 2.0 error (${details.code}): ${details.message}`);
        Error.captureStackTrace(this, this.constructor);
        this.code = details.code;
        this.data = details.data;
    }
    get name() {
        return 'RpcError';
    }
}
