import type { createSolanaRpcSubscriptionsApi } from '@solana/rpc-subscriptions-api';

import { createSolanaJsonRpcIntegerOverflowError } from './rpc-integer-overflow-error';

export const DEFAULT_RPC_SUBSCRIPTIONS_CONFIG: Partial<
    NonNullable<Parameters<typeof createSolanaRpcSubscriptionsApi>[0]>
> = {
    defaultCommitment: 'confirmed',
    onIntegerOverflow(request, keyPath, value) {
        throw createSolanaJsonRpcIntegerOverflowError(request.methodName, keyPath, value);
    },
};
