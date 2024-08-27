import { getSolanaErrorFromJsonRpcError } from '@solana/errors';
import { createJsonRpcResponseTransformer } from '@solana/rpc-spec';

type JsonRpcResponse = { error: Parameters<typeof getSolanaErrorFromJsonRpcError>[0] } | { result: unknown };

export function getThrowSolanaErrorResponseTransformer() {
    return createJsonRpcResponseTransformer(json => {
        const jsonRpcResponse = json as JsonRpcResponse;
        if ('error' in jsonRpcResponse) {
            throw getSolanaErrorFromJsonRpcError(jsonRpcResponse.error);
        }
        return jsonRpcResponse;
    });
}
