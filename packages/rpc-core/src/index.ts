import {
    IRpcApi,
    TransportRequest,
} from '@solana/rpc-transport/dist/types/json-rpc-transport/json-rpc-transport-types';
import { patchParamsForSolanaLabsRpc } from './params-patcher';
import { patchResponseForSolanaLabsRpc } from './response-patcher';
import { GetAccountInfoApi } from './rpc-methods/getAccountInfo';
import { GetBlockHeightApi } from './rpc-methods/getBlockHeight';
import { GetBlocksApi } from './rpc-methods/getBlocks';
import { GetInflationRewardApi } from './rpc-methods/getInflationReward';
import { GetBalanceApi } from './rpc-methods/getBalance';

type Config = Readonly<{
    onIntegerOverflow?: (methodName: string, keyPath: (number | string)[], value: bigint) => void;
}>;

export type SolanaRpcMethods = GetAccountInfoApi &
    GetBalanceApi &
    GetBlockHeightApi &
    GetBlocksApi &
    GetInflationRewardApi;

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
            ): TransportRequest<ReturnType<SolanaRpcMethods[TMethodName]>> {
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
