import { pipe } from '@solana/functional';
import {
    createSolanaRpcApi,
    createSolanaRpcSubscriptionsApi,
    createSolanaRpcSubscriptionsApi_UNSTABLE,
    SolanaRpcMethodsDevnet,
    SolanaRpcMethodsMainnet,
    SolanaRpcMethodsTestnet,
    SolanaRpcSubscriptions,
    SolanaRpcSubscriptionsUnstable,
} from '@solana/rpc-core';
import { createJsonRpc, createJsonSubscriptionRpc, type RpcSubscriptions } from '@solana/rpc-transport';
import { Rpc, RpcDevnet, RpcMainnet, RpcTestnet } from '@solana/rpc-transport/dist/types/json-rpc-types';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import fastStableStringify from 'fast-stable-stringify';

import { DEFAULT_RPC_CONFIG } from './rpc-default-config';
import { getRpcSubscriptionsWithSubscriptionCoalescing } from './rpc-subscription-coalescer';

type SolanaRpcMethods = SolanaRpcMethodsMainnet | SolanaRpcMethodsTestnet | SolanaRpcMethodsDevnet;

export function createSolanaRpc<TRpcMethods extends SolanaRpcMethods>(
    config: Omit<Parameters<typeof createJsonRpc>[0], 'api'>,
): TRpcMethods extends SolanaRpcMethodsDevnet
    ? RpcDevnet<SolanaRpcMethodsDevnet>
    : TRpcMethods extends SolanaRpcMethodsTestnet
      ? RpcTestnet<SolanaRpcMethodsTestnet>
      : TRpcMethods extends SolanaRpcMethodsMainnet
        ? RpcMainnet<SolanaRpcMethodsMainnet>
        : Rpc<SolanaRpcMethods> {
    return createJsonRpc({
        ...config,
        api: createSolanaRpcApi(DEFAULT_RPC_CONFIG) as Parameters<typeof createJsonRpc>[0]['api'],
    }) as TRpcMethods extends SolanaRpcMethodsDevnet
        ? RpcDevnet<SolanaRpcMethodsDevnet>
        : TRpcMethods extends SolanaRpcMethodsTestnet
          ? RpcTestnet<SolanaRpcMethodsTestnet>
          : TRpcMethods extends SolanaRpcMethodsMainnet
            ? RpcMainnet<SolanaRpcMethodsMainnet>
            : Rpc<SolanaRpcMethods>;
}

export function createSolanaRpcSubscriptions(
    config: Omit<Parameters<typeof createJsonSubscriptionRpc>[0], 'api'>,
): RpcSubscriptions<SolanaRpcSubscriptions> {
    return pipe(
        createJsonSubscriptionRpc({
            ...config,
            api: createSolanaRpcSubscriptionsApi(DEFAULT_RPC_CONFIG),
        }),
        rpcSubscriptions =>
            getRpcSubscriptionsWithSubscriptionCoalescing({
                getDeduplicationKey: (...args) => fastStableStringify(args),
                rpcSubscriptions,
            }),
    );
}

export function createSolanaRpcSubscriptions_UNSTABLE(
    config: Omit<Parameters<typeof createJsonSubscriptionRpc>[0], 'api'>,
): RpcSubscriptions<SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable> {
    return createJsonSubscriptionRpc({
        ...config,
        api: createSolanaRpcSubscriptionsApi_UNSTABLE(DEFAULT_RPC_CONFIG),
    });
}
