import type { createSolanaRpcApi } from '@solana/rpc-api';

import { createSolanaJsonRpcIntegerOverflowError } from './rpc-integer-overflow-error';

export const DEFAULT_RPC_CONFIG = {
    defaultCommitment: 'confirmed',
    onIntegerOverflow(request, keyPath, value) {
        throw createSolanaJsonRpcIntegerOverflowError(request.methodName, keyPath, value);
    },
} as const satisfies Partial<NonNullable<Parameters<typeof createSolanaRpcApi>[0]>>;
