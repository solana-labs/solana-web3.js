import { createJsonRpcResponseTransformer } from '@solana/rpc-spec';

type JsonRpcResponse = { result: unknown };

export function getResultResponseTransformer() {
    return createJsonRpcResponseTransformer(json => (json as JsonRpcResponse).result);
}
