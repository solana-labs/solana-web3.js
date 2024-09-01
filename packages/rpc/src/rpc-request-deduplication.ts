import fastStableStringify from '@solana/fast-stable-stringify';
import { RpcRequest } from '@solana/rpc-spec';

export function getSolanaRpcPayloadDeduplicationKey({ methodName, params }: RpcRequest): string | undefined {
    return fastStableStringify([methodName, params]);
}
