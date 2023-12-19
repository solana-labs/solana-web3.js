import { createSolanaRpcApi } from '@solana/rpc-core';

import { SolanaJsonRpcIntegerOverflowError } from './rpc-integer-overflow-error';

export const DEFAULT_RPC_CONFIG: Partial<Parameters<typeof createSolanaRpcApi>[0]> = {
    defaultCommitment: 'confirmed',
    onIntegerOverflow(methodName, keyPath, value) {
        throw new SolanaJsonRpcIntegerOverflowError(methodName, keyPath, value);
    },
};
