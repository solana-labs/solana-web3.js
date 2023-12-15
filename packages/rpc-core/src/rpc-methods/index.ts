import { createJsonRpcApi } from '@solana/rpc-transport';
import { IRpcApi } from '@solana/rpc-transport';

import { getParamsPatcherForSolanaLabsRpc, ParamsPatcherConfig } from '../params-patcher';
import { patchResponseForSolanaLabsRpc } from '../response-patcher';
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

type Config = ParamsPatcherConfig;

export type SolanaRpcMethods = GetAccountInfoApi &
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
    RequestAirdropApi &
    SendTransactionApi &
    SimulateTransactionApi;

export function createSolanaRpcApi(config?: Config): IRpcApi<SolanaRpcMethods> {
    return createJsonRpcApi<SolanaRpcMethods>({
        parametersTransformer: getParamsPatcherForSolanaLabsRpc(config) as (params: unknown[]) => unknown[],
        responseTransformer: patchResponseForSolanaLabsRpc,
    });
}

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

export type {
    Base64EncodedDataResponse,
    DataSlice,
    GetProgramAccountsDatasizeFilter,
    GetProgramAccountsMemcmpFilter,
    Slot,
} from './common';
