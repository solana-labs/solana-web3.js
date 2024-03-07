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

import { GetAccountInfoApi } from './getAccountInfo';
import { GetBalanceApi } from './getBalance';
import { GetBlockApi } from './getBlock';
import { GetBlockCommitmentApi } from './getBlockCommitment';
import { GetBlockHeightApi } from './getBlockHeight';
import { GetBlockProductionApi } from './getBlockProduction';
import { GetBlocksApi } from './getBlocks';
import { GetBlocksWithLimitApi } from './getBlocksWithLimit';
import { GetBlockTimeApi } from './getBlockTime';
import { GetClusterNodesApi } from './getClusterNodes';
import { GetEpochInfoApi } from './getEpochInfo';
import { GetEpochScheduleApi } from './getEpochSchedule';
import { GetFeeForMessageApi } from './getFeeForMessage';
import { GetFirstAvailableBlockApi } from './getFirstAvailableBlock';
import { GetGenesisHashApi } from './getGenesisHash';
import { GetHealthApi } from './getHealth';
import { GetHighestSnapshotSlotApi } from './getHighestSnapshotSlot';
import { GetIdentityApi } from './getIdentity';
import { GetInflationGovernorApi } from './getInflationGovernor';
import { GetInflationRateApi } from './getInflationRate';
import { GetInflationRewardApi } from './getInflationReward';
import { GetLargestAccountsApi } from './getLargestAccounts';
import { GetLatestBlockhashApi } from './getLatestBlockhash';
import { GetLeaderScheduleApi } from './getLeaderSchedule';
import { GetMaxRetransmitSlotApi } from './getMaxRetransmitSlot';
import { GetMaxShredInsertSlotApi } from './getMaxShredInsertSlot';
import { GetMinimumBalanceForRentExemptionApi } from './getMinimumBalanceForRentExemption';
import { GetMultipleAccountsApi } from './getMultipleAccounts';
import { GetProgramAccountsApi } from './getProgramAccounts';
import { GetRecentPerformanceSamplesApi } from './getRecentPerformanceSamples';
import { GetRecentPrioritizationFeesApi } from './getRecentPrioritizationFees';
import { GetSignaturesForAddressApi } from './getSignaturesForAddress';
import { GetSignatureStatusesApi } from './getSignatureStatuses';
import { GetSlotApi } from './getSlot';
import { GetSlotLeaderApi } from './getSlotLeader';
import { GetSlotLeadersApi } from './getSlotLeaders';
import { GetStakeActivationApi } from './getStakeActivation';
import { GetStakeMinimumDelegationApi } from './getStakeMinimumDelegation';
import { GetSupplyApi } from './getSupply';
import { GetTokenAccountBalanceApi } from './getTokenAccountBalance';
import { GetTokenAccountsByDelegateApi } from './getTokenAccountsByDelegate';
import { GetTokenAccountsByOwnerApi } from './getTokenAccountsByOwner';
import { GetTokenLargestAccountsApi } from './getTokenLargestAccounts';
import { GetTokenSupplyApi } from './getTokenSupply';
import { GetTransactionApi } from './getTransaction';
import { GetTransactionCountApi } from './getTransactionCount';
import { GetVersionApi } from './getVersion';
import { GetVoteAccountsApi } from './getVoteAccounts';
import { IsBlockhashValidApi } from './isBlockhashValid';
import { MinimumLedgerSlotApi } from './minimumLedgerSlot';
import { RequestAirdropApi } from './requestAirdrop';
import { SendTransactionApi } from './sendTransaction';
import { SimulateTransactionApi } from './simulateTransaction';

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
