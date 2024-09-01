import type { createSolanaRpcApi } from '@solana/rpc-api';

import { createSolanaJsonRpcIntegerOverflowError } from './rpc-integer-overflow-error';

export const DEFAULT_RPC_CONFIG: Partial<NonNullable<Parameters<typeof createSolanaRpcApi>[0]>> = {
    defaultCommitment: 'confirmed',
    onIntegerOverflow(request, keyPath, value) {
        throw createSolanaJsonRpcIntegerOverflowError(request.methodName, keyPath, value);
    },
};
