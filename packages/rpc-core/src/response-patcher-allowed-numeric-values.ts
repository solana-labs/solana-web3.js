import { KeyPath } from './response-patcher';
import { KEYPATH_WILDCARD } from './response-patcher-types';
import { createSolanaRpcApi } from './rpc-methods';

/**
 * These are keypaths at the end of which you will find a numeric value that should *not* be upcast
 * to a `bigint`. These are values that are legitimately defined as `u8` or `usize` on the backend.
 */
export const ALLOWED_NUMERIC_KEYPATHS: Partial<
    Record<keyof ReturnType<typeof createSolanaRpcApi>, readonly KeyPath[]>
> = {
    getBlockTime: [[]],
    getInflationReward: [[KEYPATH_WILDCARD, 'commission']],
    getRecentPerformanceSamples: [[KEYPATH_WILDCARD, 'samplePeriodSecs']],
    getVoteAccounts: [
        ['current', KEYPATH_WILDCARD, 'commission'],
        ['delinquent', KEYPATH_WILDCARD, 'commission'],
    ],
};
