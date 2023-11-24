import type { IRpcApi, RpcRequest } from '@solana/rpc-transport';

import { patchParamsForSolanaLabsRpc } from '../params-patcher.js';
import { patchResponseForSolanaLabsRpc } from '../response-patcher.js';
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

type Config = Readonly<{
    onIntegerOverflow?: (methodName: string, keyPath: (number | string)[], value: bigint) => void;
}>;

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
    return new Proxy({} as IRpcApi<SolanaRpcMethods>, {
        defineProperty() {
            return false;
        },
        deleteProperty() {
            return false;
        },
        get<TMethodName extends keyof IRpcApi<SolanaRpcMethods>>(
            ...args: Parameters<NonNullable<ProxyHandler<IRpcApi<SolanaRpcMethods>>['get']>>
        ) {
            const [_, p] = args;
            const methodName = p.toString() as keyof SolanaRpcMethods;
            return function (
                ...rawParams: Parameters<
                    SolanaRpcMethods[TMethodName] extends CallableFunction ? SolanaRpcMethods[TMethodName] : never
                >
            ): RpcRequest<ReturnType<SolanaRpcMethods[TMethodName]>> {
                const handleIntegerOverflow = config?.onIntegerOverflow;
                const params = patchParamsForSolanaLabsRpc(
                    rawParams,
                    handleIntegerOverflow
                        ? (keyPath, value) => handleIntegerOverflow(methodName, keyPath, value)
                        : undefined
                );
                return {
                    methodName,
                    params,
                    responseProcessor: rawResponse => patchResponseForSolanaLabsRpc(rawResponse, methodName),
                };
            };
        },
    });
}

export type {
    GetAccountInfoApi,
    GetBlockApi,
    GetProgramAccountsApi,
    GetSignatureStatusesApi,
    GetTransactionApi,
    RequestAirdropApi,
    SendTransactionApi,
};

export type {
    Base64EncodedDataResponse,
    DataSlice,
    GetProgramAccountsDatasizeFilter,
    GetProgramAccountsMemcmpFilter,
    Slot,
} from './common.js';
