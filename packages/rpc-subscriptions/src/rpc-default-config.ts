import type { createSolanaRpcSubscriptionsApi } from '@solana/rpc-subscriptions-api';

import { createSolanaJsonRpcIntegerOverflowError } from './rpc-integer-overflow-error';

export const DEFAULT_RPC_CONFIG: Partial<Parameters<typeof createSolanaRpcSubscriptionsApi>[0]> = {
    defaultCommitment: 'confirmed',
    onIntegerOverflow(methodName, keyPath, value) {
        throw createSolanaJsonRpcIntegerOverflowError(methodName, keyPath, value);
    },
};
