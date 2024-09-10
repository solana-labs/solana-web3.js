import fastStableStringify from '@solana/fast-stable-stringify';
import { isJsonRpcPayload } from '@solana/rpc-spec';

export function getSolanaRpcPayloadDeduplicationKey(payload: unknown): string | undefined {
    return isJsonRpcPayload(payload) ? fastStableStringify([payload.method, payload.params]) : undefined;
}
