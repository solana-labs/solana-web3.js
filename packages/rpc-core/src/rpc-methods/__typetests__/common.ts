import { createJsonRpc } from '@solana/rpc-transport';
import { PendingRpcRequest } from '@solana/rpc-transport/dist/types/json-rpc-types';

import { SolanaRpcMethods } from '..';

type MockTypeTestRpc = ReturnType<typeof createJsonRpc<SolanaRpcMethods>>;

export function mockTypeTestRpc(): MockTypeTestRpc {
    return {} as MockTypeTestRpc;
}

type PromiseType<T extends Promise<unknown>> = T extends Promise<infer R> ? R : never;

export function mockTypeTestResponse<T extends PendingRpcRequest<unknown>>(
    _request: T
): PromiseType<ReturnType<T['send']>> {
    return {} as PromiseType<ReturnType<T['send']>>;
}
