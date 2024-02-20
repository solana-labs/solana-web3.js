// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import fastStableStringify from 'fast-stable-stringify';

function isJsonRpcPayload(payload: unknown): payload is Readonly<{ method: string; params: unknown }> {
    if (payload == null || typeof payload !== 'object' || Array.isArray(payload)) {
        return false;
    }
    return (
        'jsonrpc' in payload &&
        payload.jsonrpc === '2.0' &&
        'method' in payload &&
        typeof payload.method === 'string' &&
        'params' in payload
    );
}

export function getSolanaRpcPayloadDeduplicationKey(payload: unknown): string | undefined {
    return isJsonRpcPayload(payload) ? fastStableStringify([payload.method, payload.params]) : undefined;
}
