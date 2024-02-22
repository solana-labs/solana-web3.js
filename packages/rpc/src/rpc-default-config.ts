import type { createSolanaRpcApi } from '@solana/rpc-api';

import { createSolanaJsonRpcIntegerOverflowError } from './rpc-integer-overflow-error';

export const DEFAULT_RPC_CONFIG: Partial<Parameters<typeof createSolanaRpcApi>[0]> = {
    defaultCommitment: 'confirmed',
    onIntegerOverflow(methodName, keyPath, value) {
        throw createSolanaJsonRpcIntegerOverflowError(methodName, keyPath, value);
    },
};
