import { RpcResponseTransformer } from '@solana/rpc-spec-types';

type JsonRpcResponse = { result: unknown };

export function getResultResponseTransformer(): RpcResponseTransformer {
    return json => (json as JsonRpcResponse).result;
}
