import { IRpcSubscriptionsApi } from '@solana/rpc-transport/dist/types/json-rpc-types';

import { KeyPath } from './response-patcher';
import { KEYPATH_WILDCARD } from './response-patcher-types';
import { createSolanaRpcApi } from './rpc-methods';
import { SolanaRpcSubscriptions, SolanaRpcSubscriptionsUnstable } from './rpc-subscriptions';

// Numeric values nested in `jsonParsed` accounts
const jsonParsedTokenAccountsConfigs = [
    // parsed Token/Token22 token account
    ['data', 'parsed', 'info', 'tokenAmount', 'decimals'],
    ['data', 'parsed', 'info', 'tokenAmount', 'uiAmount'],
    ['data', 'parsed', 'info', 'rentExemptReserve', 'decimals'],
    ['data', 'parsed', 'info', 'rentExemptReserve', 'uiAmount'],
    ['data', 'parsed', 'info', 'delegatedAmount', 'decimals'],
    ['data', 'parsed', 'info', 'delegatedAmount', 'uiAmount'],
    ['data', 'parsed', 'info', 'extensions', KEYPATH_WILDCARD, 'state', 'olderTransferFee', 'transferFeeBasisPoints'],
    ['data', 'parsed', 'info', 'extensions', KEYPATH_WILDCARD, 'state', 'newerTransferFee', 'transferFeeBasisPoints'],
    ['data', 'parsed', 'info', 'extensions', KEYPATH_WILDCARD, 'state', 'preUpdateAverageRate'],
    ['data', 'parsed', 'info', 'extensions', KEYPATH_WILDCARD, 'state', 'currentRate'],
];
const jsonParsedAccountsConfigs = [
    ...jsonParsedTokenAccountsConfigs,
    // parsed AddressTableLookup account
    ['data', 'parsed', 'info', 'lastExtendedSlotStartIndex'],
    // parsed Config account
    ['data', 'parsed', 'info', 'slashPenalty'],
    ['data', 'parsed', 'info', 'warmupCooldownRate'],
    // parsed Token/Token22 mint account
    ['data', 'parsed', 'info', 'decimals'],
    // parsed Token/Token22 multisig account
    ['data', 'parsed', 'info', 'numRequiredSigners'],
    ['data', 'parsed', 'info', 'numValidSigners'],
    // parsed Stake account
    ['data', 'parsed', 'info', 'stake', 'delegation', 'warmupCooldownRate'],
    // parsed Sysvar rent account
    ['data', 'parsed', 'info', 'exemptionThreshold'],
    ['data', 'parsed', 'info', 'burnPercent'],
    // parsed Vote account
    ['data', 'parsed', 'info', 'commission'],
    ['data', 'parsed', 'info', 'votes', KEYPATH_WILDCARD, 'confirmationCount'],
];

type AllowedNumericKeypaths<TApi> = Partial<Record<keyof TApi, readonly KeyPath[]>>;

let memoizedNotificationKeypaths: AllowedNumericKeypaths<
    IRpcSubscriptionsApi<SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable>
>;
let memoizedResponseKeypaths: AllowedNumericKeypaths<ReturnType<typeof createSolanaRpcApi>>;

/**
 * These are keypaths at the end of which you will find a numeric value that should *not* be upcast
 * to a `bigint`. These are values that are legitimately defined as `u8` or `usize` on the backend.
 */
export function getAllowedNumericKeypathsForNotification(): AllowedNumericKeypaths<
    IRpcSubscriptionsApi<SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable>
> {
    if (!memoizedNotificationKeypaths) {
        memoizedNotificationKeypaths = {
            accountNotifications: jsonParsedAccountsConfigs.map(c => ['value', ...c]),
            blockNotifications: [
                ['value', 'block', 'blockTime'],
                [
                    'value',
                    'block',
                    'transactions',
                    KEYPATH_WILDCARD,
                    'meta',
                    'preTokenBalances',
                    KEYPATH_WILDCARD,
                    'accountIndex',
                ],
                [
                    'value',
                    'block',
                    'transactions',
                    KEYPATH_WILDCARD,
                    'meta',
                    'preTokenBalances',
                    KEYPATH_WILDCARD,
                    'uiTokenAmount',
                    'decimals',
                ],
                [
                    'value',
                    'block',
                    'transactions',
                    KEYPATH_WILDCARD,
                    'meta',
                    'postTokenBalances',
                    KEYPATH_WILDCARD,
                    'accountIndex',
                ],
                [
                    'value',
                    'block',
                    'transactions',
                    KEYPATH_WILDCARD,
                    'meta',
                    'postTokenBalances',
                    KEYPATH_WILDCARD,
                    'uiTokenAmount',
                    'decimals',
                ],
                ['value', 'block', 'transactions', KEYPATH_WILDCARD, 'meta', 'rewards', KEYPATH_WILDCARD, 'commission'],
                [
                    'value',
                    'block',
                    'transactions',
                    KEYPATH_WILDCARD,
                    'meta',
                    'innerInstructions',
                    KEYPATH_WILDCARD,
                    'index',
                ],
                [
                    'value',
                    'block',
                    'transactions',
                    KEYPATH_WILDCARD,
                    'meta',
                    'innerInstructions',
                    KEYPATH_WILDCARD,
                    'instructions',
                    KEYPATH_WILDCARD,
                    'programIdIndex',
                ],
                [
                    'value',
                    'block',
                    'transactions',
                    KEYPATH_WILDCARD,
                    'meta',
                    'innerInstructions',
                    KEYPATH_WILDCARD,
                    'instructions',
                    KEYPATH_WILDCARD,
                    'accounts',
                    KEYPATH_WILDCARD,
                ],
                [
                    'value',
                    'block',
                    'transactions',
                    KEYPATH_WILDCARD,
                    'transaction',
                    'message',
                    'addressTableLookups',
                    KEYPATH_WILDCARD,
                    'writableIndexes',
                    KEYPATH_WILDCARD,
                ],
                [
                    'value',
                    'block',
                    'transactions',
                    KEYPATH_WILDCARD,
                    'transaction',
                    'message',
                    'addressTableLookups',
                    KEYPATH_WILDCARD,
                    'readonlyIndexes',
                    KEYPATH_WILDCARD,
                ],
                [
                    'value',
                    'block',
                    'transactions',
                    KEYPATH_WILDCARD,
                    'transaction',
                    'message',
                    'instructions',
                    KEYPATH_WILDCARD,
                    'programIdIndex',
                ],
                [
                    'value',
                    'block',
                    'transactions',
                    KEYPATH_WILDCARD,
                    'transaction',
                    'message',
                    'instructions',
                    KEYPATH_WILDCARD,
                    'accounts',
                    KEYPATH_WILDCARD,
                ],
                [
                    'value',
                    'block',
                    'transactions',
                    KEYPATH_WILDCARD,
                    'transaction',
                    'message',
                    'header',
                    'numReadonlySignedAccounts',
                ],
                [
                    'value',
                    'block',
                    'transactions',
                    KEYPATH_WILDCARD,
                    'transaction',
                    'message',
                    'header',
                    'numReadonlyUnsignedAccounts',
                ],
                [
                    'value',
                    'block',
                    'transactions',
                    KEYPATH_WILDCARD,
                    'transaction',
                    'message',
                    'header',
                    'numRequiredSignatures',
                ],
                ['value', 'block', 'rewards', KEYPATH_WILDCARD, 'commission'],
            ],
            programNotifications: jsonParsedAccountsConfigs.flatMap(c => [
                ['value', KEYPATH_WILDCARD, 'account', ...c],
                [KEYPATH_WILDCARD, 'account', ...c],
            ]),
        };
    }
    return memoizedNotificationKeypaths;
}

/**
 * These are keypaths at the end of which you will find a numeric value that should *not* be upcast
 * to a `bigint`. These are values that are legitimately defined as `u8` or `usize` on the backend.
 */
export function getAllowedNumericKeypathsForResponse(): AllowedNumericKeypaths<ReturnType<typeof createSolanaRpcApi>> {
    if (!memoizedResponseKeypaths) {
        memoizedResponseKeypaths = {
            getAccountInfo: jsonParsedAccountsConfigs.map(c => ['value', ...c]),
            getBlock: [
                ['blockTime'],
                ['transactions', KEYPATH_WILDCARD, 'meta', 'preTokenBalances', KEYPATH_WILDCARD, 'accountIndex'],
                [
                    'transactions',
                    KEYPATH_WILDCARD,
                    'meta',
                    'preTokenBalances',
                    KEYPATH_WILDCARD,
                    'uiTokenAmount',
                    'decimals',
                ],
                ['transactions', KEYPATH_WILDCARD, 'meta', 'postTokenBalances', KEYPATH_WILDCARD, 'accountIndex'],
                [
                    'transactions',
                    KEYPATH_WILDCARD,
                    'meta',
                    'postTokenBalances',
                    KEYPATH_WILDCARD,
                    'uiTokenAmount',
                    'decimals',
                ],
                ['transactions', KEYPATH_WILDCARD, 'meta', 'rewards', KEYPATH_WILDCARD, 'commission'],
                ['transactions', KEYPATH_WILDCARD, 'meta', 'innerInstructions', KEYPATH_WILDCARD, 'index'],
                [
                    'transactions',
                    KEYPATH_WILDCARD,
                    'meta',
                    'innerInstructions',
                    KEYPATH_WILDCARD,
                    'instructions',
                    KEYPATH_WILDCARD,
                    'programIdIndex',
                ],
                [
                    'transactions',
                    KEYPATH_WILDCARD,
                    'meta',
                    'innerInstructions',
                    KEYPATH_WILDCARD,
                    'instructions',
                    KEYPATH_WILDCARD,
                    'accounts',
                    KEYPATH_WILDCARD,
                ],
                [
                    'transactions',
                    KEYPATH_WILDCARD,
                    'transaction',
                    'message',
                    'addressTableLookups',
                    KEYPATH_WILDCARD,
                    'writableIndexes',
                    KEYPATH_WILDCARD,
                ],
                [
                    'transactions',
                    KEYPATH_WILDCARD,
                    'transaction',
                    'message',
                    'addressTableLookups',
                    KEYPATH_WILDCARD,
                    'readonlyIndexes',
                    KEYPATH_WILDCARD,
                ],
                [
                    'transactions',
                    KEYPATH_WILDCARD,
                    'transaction',
                    'message',
                    'instructions',
                    KEYPATH_WILDCARD,
                    'programIdIndex',
                ],
                [
                    'transactions',
                    KEYPATH_WILDCARD,
                    'transaction',
                    'message',
                    'instructions',
                    KEYPATH_WILDCARD,
                    'accounts',
                    KEYPATH_WILDCARD,
                ],
                ['transactions', KEYPATH_WILDCARD, 'transaction', 'message', 'header', 'numReadonlySignedAccounts'],
                ['transactions', KEYPATH_WILDCARD, 'transaction', 'message', 'header', 'numReadonlyUnsignedAccounts'],
                ['transactions', KEYPATH_WILDCARD, 'transaction', 'message', 'header', 'numRequiredSignatures'],
                ['rewards', KEYPATH_WILDCARD, 'commission'],
            ],
            getBlockTime: [[]],
            getClusterNodes: [
                [KEYPATH_WILDCARD, 'featureSet'],
                [KEYPATH_WILDCARD, 'shredVersion'],
            ],
            getInflationGovernor: [['initial'], ['foundation'], ['foundationTerm'], ['taper'], ['terminal']],
            getInflationRate: [['foundation'], ['total'], ['validator']],
            getInflationReward: [[KEYPATH_WILDCARD, 'commission']],
            getMultipleAccounts: jsonParsedAccountsConfigs.map(c => ['value', KEYPATH_WILDCARD, ...c]),
            getProgramAccounts: jsonParsedAccountsConfigs.flatMap(c => [
                ['value', KEYPATH_WILDCARD, 'account', ...c],
                [KEYPATH_WILDCARD, 'account', ...c],
            ]),
            getRecentPerformanceSamples: [[KEYPATH_WILDCARD, 'samplePeriodSecs']],
            getTokenAccountBalance: [
                ['value', 'decimals'],
                ['value', 'uiAmount'],
            ],
            getTokenAccountsByDelegate: jsonParsedTokenAccountsConfigs.map(c => [
                'value',
                KEYPATH_WILDCARD,
                'account',
                ...c,
            ]),
            getTokenAccountsByOwner: jsonParsedTokenAccountsConfigs.map(c => [
                'value',
                KEYPATH_WILDCARD,
                'account',
                ...c,
            ]),
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
                [
                    'meta',
                    'innerInstructions',
                    KEYPATH_WILDCARD,
                    'instructions',
                    KEYPATH_WILDCARD,
                    'accounts',
                    KEYPATH_WILDCARD,
                ],
                [
                    'transaction',
                    'message',
                    'addressTableLookups',
                    KEYPATH_WILDCARD,
                    'writableIndexes',
                    KEYPATH_WILDCARD,
                ],
                [
                    'transaction',
                    'message',
                    'addressTableLookups',
                    KEYPATH_WILDCARD,
                    'readonlyIndexes',
                    KEYPATH_WILDCARD,
                ],
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
            simulateTransaction: jsonParsedAccountsConfigs.map(c => ['value', 'accounts', KEYPATH_WILDCARD, ...c]),
        };
    }
    return memoizedResponseKeypaths;
}
