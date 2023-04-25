import { IRpcApi, RpcRequest } from '@solana/rpc-transport/dist/types/json-rpc-types';
import { patchParamsForSolanaLabsRpc } from './params-patcher';
import { patchResponseForSolanaLabsRpc } from './response-patcher';
import { GetAccountInfoApi } from './rpc-methods/getAccountInfo';
import { GetBalanceApi } from './rpc-methods/getBalance';
import { GetBlockHeightApi } from './rpc-methods/getBlockHeight';
import { GetBlockProductionApi } from './rpc-methods/getBlockProduction';
import { GetBlocksApi } from './rpc-methods/getBlocks';
import { GetFirstAvailableBlockApi } from './rpc-methods/getFirstAvailableBlock';
import { GetInflationRewardApi } from './rpc-methods/getInflationReward';
import { GetMaxRetransmitSlotApi } from './rpc-methods/getMaxRetransmitSlot';
import { GetMaxShredInsertSlotApi } from './rpc-methods/getMaxShredInsertSlot';
import { GetSlotApi } from './rpc-methods/getSlot';
import { GetStakeMinimumDelegationApi } from './rpc-methods/getStakeMinimumDelegation';
import { GetTransactionCountApi } from './rpc-methods/getTransactionCount';
import { MinimumLedgerSlotApi } from './rpc-methods/minimumLedgerSlot';

type Config = Readonly<{
    onIntegerOverflow?: (methodName: string, keyPath: (number | string)[], value: bigint) => void;
}>;

export type SolanaRpcMethods = GetAccountInfoApi &
    GetBalanceApi &
    GetBlockHeightApi &
    GetBlockProductionApi &
    GetBlocksApi &
    GetFirstAvailableBlockApi &
    GetInflationRewardApi &
    GetMaxRetransmitSlotApi &
    GetMaxShredInsertSlotApi &
    GetSlotApi &
    GetStakeMinimumDelegationApi &
    GetTransactionCountApi &
    MinimumLedgerSlotApi;

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
