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
    getAccountInfo: [
        // parsed AddressTableLookup account
        ['value', 'data', 'parsed', 'info', 'lastExtendedSlotStartIndex'],
        // parsed Config account
        ['value', 'data', 'parsed', 'info', 'slashPenalty'],
        ['value', 'data', 'parsed', 'info', 'warmupCooldownRate'],
        // parsed Token/Token22 token account
        ['value', 'data', 'parsed', 'info', 'tokenAmount', 'decimals'],
        ['value', 'data', 'parsed', 'info', 'tokenAmount', 'uiAmount'],
        ['value', 'data', 'parsed', 'info', 'rentExemptReserve', 'decimals'],
        ['value', 'data', 'parsed', 'info', 'delegatedAmount', 'decimals'],
        [
            'value',
            'data',
            'parsed',
            'info',
            'extensions',
            KEYPATH_WILDCARD,
            'state',
            'olderTransferFee',
            'transferFeeBasisPoints',
        ],
        [
            'value',
            'data',
            'parsed',
            'info',
            'extensions',
            KEYPATH_WILDCARD,
            'state',
            'newerTransferFee',
            'transferFeeBasisPoints',
        ],
        ['value', 'data', 'parsed', 'info', 'extensions', KEYPATH_WILDCARD, 'state', 'preUpdateAverageRate'],
        ['value', 'data', 'parsed', 'info', 'extensions', KEYPATH_WILDCARD, 'state', 'currentRate'],
        // parsed Token/Token22 mint account
        ['value', 'data', 'parsed', 'info', 'decimals'],
        // parsed Token/Token22 multisig account
        ['value', 'data', 'parsed', 'info', 'numRequiredSigners'],
        ['value', 'data', 'parsed', 'info', 'numValidSigners'],
        // parsed Stake account
        ['value', 'data', 'parsed', 'info', 'stake', 'delegation', 'warmupCooldownRate'],
        // parsed Sysvar rent account
        ['value', 'data', 'parsed', 'info', 'exemptionThreshold'],
        ['value', 'data', 'parsed', 'info', 'burnPercent'],
        // parsed Vote account
        ['value', 'data', 'parsed', 'info', 'commission'],
        ['value', 'data', 'parsed', 'info', 'votes', KEYPATH_WILDCARD, 'confirmationCount'],
    ],
    getBlockTime: [[]],
    getInflationGovernor: [['initial'], ['foundation'], ['foundationTerm'], ['taper'], ['terminal']],
    getInflationRate: [['foundation'], ['total'], ['validator']],
    getInflationReward: [[KEYPATH_WILDCARD, 'commission']],
    getRecentPerformanceSamples: [[KEYPATH_WILDCARD, 'samplePeriodSecs']],
    getTokenAccountBalance: [
        ['value', 'decimals'],
        ['value', 'uiAmount'],
    ],
    getTokenLargestAccounts: [
        ['value', KEYPATH_WILDCARD, 'decimals'],
        ['value', KEYPATH_WILDCARD, 'uiAmount'],
    ],
    getTokenSupply: [
        ['value', 'decimals'],
        ['value', 'uiAmount'],
    ],
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
    getVersion: [['feature-set']],
    getVoteAccounts: [
        ['current', KEYPATH_WILDCARD, 'commission'],
        ['delinquent', KEYPATH_WILDCARD, 'commission'],
    ],
};
