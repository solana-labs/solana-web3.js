import { createRpcApi, RpcApi } from '@solana/rpc-spec';
import {
    AllowedNumericKeypaths,
    getDefaultParamsTransformerForSolanaRpc,
    getDefaultResponseTransformerForSolanaRpc,
    jsonParsedAccountsConfigs,
    jsonParsedTokenAccountsConfigs,
    KEYPATH_WILDCARD,
    ParamsTransformerConfig,
} from '@solana/rpc-transformers';

import { GetAccountInfoApi } from './getAccountInfo.js';
import { GetBalanceApi } from './getBalance.js';
import { GetBlockApi } from './getBlock.js';
import { GetBlockCommitmentApi } from './getBlockCommitment.js';
import { GetBlockHeightApi } from './getBlockHeight.js';
import { GetBlockProductionApi } from './getBlockProduction.js';
import { GetBlocksApi } from './getBlocks.js';
import { GetBlocksWithLimitApi } from './getBlocksWithLimit.js';
import { GetBlockTimeApi } from './getBlockTime.js';
import { GetClusterNodesApi } from './getClusterNodes.js';
import { GetEpochInfoApi } from './getEpochInfo.js';
import { GetEpochScheduleApi } from './getEpochSchedule.js';
import { GetFeeForMessageApi } from './getFeeForMessage.js';
import { GetFirstAvailableBlockApi } from './getFirstAvailableBlock.js';
import { GetGenesisHashApi } from './getGenesisHash.js';
import { GetHealthApi } from './getHealth.js';
import { GetHighestSnapshotSlotApi } from './getHighestSnapshotSlot.js';
import { GetIdentityApi } from './getIdentity.js';
import { GetInflationGovernorApi } from './getInflationGovernor.js';
import { GetInflationRateApi } from './getInflationRate.js';
import { GetInflationRewardApi } from './getInflationReward.js';
import { GetLargestAccountsApi } from './getLargestAccounts.js';
import { GetLatestBlockhashApi } from './getLatestBlockhash.js';
import { GetLeaderScheduleApi } from './getLeaderSchedule.js';
import { GetMaxRetransmitSlotApi } from './getMaxRetransmitSlot.js';
import { GetMaxShredInsertSlotApi } from './getMaxShredInsertSlot.js';
import { GetMinimumBalanceForRentExemptionApi } from './getMinimumBalanceForRentExemption.js';
import { GetMultipleAccountsApi } from './getMultipleAccounts.js';
import { GetProgramAccountsApi } from './getProgramAccounts.js';
import { GetRecentPerformanceSamplesApi } from './getRecentPerformanceSamples.js';
import { GetRecentPrioritizationFeesApi } from './getRecentPrioritizationFees.js';
import { GetSignaturesForAddressApi } from './getSignaturesForAddress.js';
import { GetSignatureStatusesApi } from './getSignatureStatuses.js';
import { GetSlotApi } from './getSlot.js';
import { GetSlotLeaderApi } from './getSlotLeader.js';
import { GetSlotLeadersApi } from './getSlotLeaders.js';
import { GetStakeActivationApi } from './getStakeActivation.js';
import { GetStakeMinimumDelegationApi } from './getStakeMinimumDelegation.js';
import { GetSupplyApi } from './getSupply.js';
import { GetTokenAccountBalanceApi } from './getTokenAccountBalance.js';
import { GetTokenAccountsByDelegateApi } from './getTokenAccountsByDelegate.js';
import { GetTokenAccountsByOwnerApi } from './getTokenAccountsByOwner.js';
import { GetTokenLargestAccountsApi } from './getTokenLargestAccounts.js';
import { GetTokenSupplyApi } from './getTokenSupply.js';
import { GetTransactionApi } from './getTransaction.js';
import { GetTransactionCountApi } from './getTransactionCount.js';
import { GetVersionApi } from './getVersion.js';
import { GetVoteAccountsApi } from './getVoteAccounts.js';
import { IsBlockhashValidApi } from './isBlockhashValid.js';
import { MinimumLedgerSlotApi } from './minimumLedgerSlot.js';
import { RequestAirdropApi } from './requestAirdrop.js';
import { SendTransactionApi } from './sendTransaction.js';
import { SimulateTransactionApi } from './simulateTransaction.js';

type SolanaRpcApiForAllClusters = GetAccountInfoApi &
    GetBalanceApi &
    GetBlockApi &
    GetBlockCommitmentApi &
    GetBlockHeightApi &
    GetBlockProductionApi &
    GetBlocksApi &
    GetBlocksWithLimitApi &
    GetBlockTimeApi &
    GetClusterNodesApi &
    GetEpochInfoApi &
    GetEpochScheduleApi &
    GetFeeForMessageApi &
    GetFirstAvailableBlockApi &
    GetGenesisHashApi &
    GetHealthApi &
    GetHighestSnapshotSlotApi &
    GetIdentityApi &
    GetInflationGovernorApi &
    GetInflationRateApi &
    GetInflationRewardApi &
    GetLargestAccountsApi &
    GetLatestBlockhashApi &
    GetLeaderScheduleApi &
    GetMaxRetransmitSlotApi &
    GetMaxShredInsertSlotApi &
    GetMinimumBalanceForRentExemptionApi &
    GetMultipleAccountsApi &
    GetProgramAccountsApi &
    GetRecentPerformanceSamplesApi &
    GetRecentPrioritizationFeesApi &
    GetSignaturesForAddressApi &
    GetSignatureStatusesApi &
    GetSlotApi &
    GetSlotLeaderApi &
    GetSlotLeadersApi &
    GetStakeActivationApi &
    GetStakeMinimumDelegationApi &
    GetSupplyApi &
    GetTokenAccountBalanceApi &
    GetTokenAccountsByDelegateApi &
    GetTokenAccountsByOwnerApi &
    GetTokenLargestAccountsApi &
    GetTokenSupplyApi &
    GetTransactionApi &
    GetTransactionCountApi &
    GetVersionApi &
    GetVoteAccountsApi &
    IsBlockhashValidApi &
    MinimumLedgerSlotApi &
    SendTransactionApi &
    SimulateTransactionApi;
type SolanaRpcApiForTestClusters = RequestAirdropApi & SolanaRpcApiForAllClusters;
export type SolanaRpcApi = SolanaRpcApiForTestClusters;
export type SolanaRpcApiDevnet = SolanaRpcApiForTestClusters;
export type SolanaRpcApiTestnet = SolanaRpcApiForTestClusters;
export type SolanaRpcApiMainnet = SolanaRpcApiForAllClusters;

export type {
    GetAccountInfoApi,
    GetBalanceApi,
    GetBlockApi,
    GetBlockCommitmentApi,
    GetBlockHeightApi,
    GetBlockProductionApi,
    GetBlocksApi,
    GetBlocksWithLimitApi,
    GetBlockTimeApi,
    GetClusterNodesApi,
    GetEpochInfoApi,
    GetEpochScheduleApi,
    GetFeeForMessageApi,
    GetFirstAvailableBlockApi,
    GetGenesisHashApi,
    GetHealthApi,
    GetHighestSnapshotSlotApi,
    GetIdentityApi,
    GetInflationGovernorApi,
    GetInflationRateApi,
    GetInflationRewardApi,
    GetLargestAccountsApi,
    GetLatestBlockhashApi,
    GetLeaderScheduleApi,
    GetMaxRetransmitSlotApi,
    GetMaxShredInsertSlotApi,
    GetMinimumBalanceForRentExemptionApi,
    GetMultipleAccountsApi,
    GetProgramAccountsApi,
    GetRecentPerformanceSamplesApi,
    GetRecentPrioritizationFeesApi,
    GetSignaturesForAddressApi,
    GetSignatureStatusesApi,
    GetSlotApi,
    GetSlotLeaderApi,
    GetSlotLeadersApi,
    GetStakeActivationApi,
    GetStakeMinimumDelegationApi,
    GetSupplyApi,
    GetTokenAccountBalanceApi,
    GetTokenAccountsByDelegateApi,
    GetTokenAccountsByOwnerApi,
    GetTokenLargestAccountsApi,
    GetTokenSupplyApi,
    GetTransactionApi,
    GetTransactionCountApi,
    GetVersionApi,
    GetVoteAccountsApi,
    IsBlockhashValidApi,
    MinimumLedgerSlotApi,
    RequestAirdropApi,
    SendTransactionApi,
    SimulateTransactionApi,
};

type Config = ParamsTransformerConfig;

export function createSolanaRpcApi<
    TRpcMethods extends SolanaRpcApi | SolanaRpcApiDevnet | SolanaRpcApiMainnet | SolanaRpcApiTestnet = SolanaRpcApi,
>(config?: Config): RpcApi<TRpcMethods> {
    return createRpcApi<TRpcMethods>({
        parametersTransformer: getDefaultParamsTransformerForSolanaRpc(config) as (params: unknown[]) => unknown[],
        responseTransformer: getDefaultResponseTransformerForSolanaRpc({
            allowedNumericKeyPaths: getAllowedNumericKeypaths(),
        }),
    });
}

let memoizedKeypaths: AllowedNumericKeypaths<RpcApi<SolanaRpcApi>>;

/**
 * These are keypaths at the end of which you will find a numeric value that should *not* be upcast
 * to a `bigint`. These are values that are legitimately defined as `u8` or `usize` on the backend.
 */
function getAllowedNumericKeypaths(): AllowedNumericKeypaths<RpcApi<SolanaRpcApi>> {
    if (!memoizedKeypaths) {
        memoizedKeypaths = {
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
    return memoizedKeypaths;
}
