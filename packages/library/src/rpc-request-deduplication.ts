// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import fastStableStringify from 'fast-stable-stringify';

export function getSolanaRpcPayloadDeduplicationKey(payload: unknown): string | undefined {
    if (payload == null || typeof payload !== 'object' || Array.isArray(payload)) {
        return;
    }
    if ('jsonrpc' in payload && payload.jsonrpc === '2.0' && 'method' in payload && 'params' in payload) {
        return fastStableStringify([payload.method, payload.params]);
    }
}
