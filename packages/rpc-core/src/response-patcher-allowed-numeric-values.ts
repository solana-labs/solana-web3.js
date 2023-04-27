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
    getTransaction: [
        ['meta', 'preTokenBalances', KEYPATH_WILDCARD, 'accountIndex'],
        ['meta', 'preTokenBalances', KEYPATH_WILDCARD, 'uiTokenAmount', 'decimals'],
        ['meta', 'postTokenBalances', KEYPATH_WILDCARD, 'accountIndex'],
        ['meta', 'postTokenBalances', KEYPATH_WILDCARD, 'uiTokenAmount', 'decimals'],
        ['meta', 'rewards', KEYPATH_WILDCARD, 'commission'],
        ['meta', 'innerInstructions', KEYPATH_WILDCARD, 'index'],
        ['meta', 'innerInstructions', KEYPATH_WILDCARD, 'instructions', KEYPATH_WILDCARD, 'programIdIndex'],
        ['meta', 'innerInstructions', KEYPATH_WILDCARD, 'instructions', KEYPATH_WILDCARD, 'accounts', KEYPATH_WILDCARD],
        ['transaction', 'message', 'addressTableLookups', KEYPATH_WILDCARD, 'writableIndexes', KEYPATH_WILDCARD],
        ['transaction', 'message', 'addressTableLookups', KEYPATH_WILDCARD, 'readonlyIndexes', KEYPATH_WILDCARD],
        ['transaction', 'message', 'instructions', KEYPATH_WILDCARD, 'programIdIndex'],
        ['transaction', 'message', 'instructions', KEYPATH_WILDCARD, 'accounts', KEYPATH_WILDCARD],
        ['transaction', 'message', 'header', 'numReadonlySignedAccounts'],
        ['transaction', 'message', 'header', 'numReadonlyUnsignedAccounts'],
        ['transaction', 'message', 'header', 'numRequiredSignatures'],
    ],
    getVoteAccounts: [
        ['current', KEYPATH_WILDCARD, 'commission'],
        ['delinquent', KEYPATH_WILDCARD, 'commission'],
    ],
};
