import { pipe } from '@solana/functional';
import {
    createSolanaRpcApi,
    createSolanaRpcSubscriptionsApi,
    createSolanaRpcSubscriptionsApi_UNSTABLE,
    SolanaRpcMethods,
    SolanaRpcSubscriptions,
    SolanaRpcSubscriptionsUnstable,
} from '@solana/rpc-core';
import { createJsonRpc, createJsonSubscriptionRpc } from '@solana/rpc-transport';
import type { Rpc, RpcSubscriptions } from '@solana/rpc-transport/dist/types/json-rpc-types';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import fastStableStringify from 'fast-stable-stringify';

import { DEFAULT_RPC_CONFIG } from './rpc-default-config';
import { getRpcSubscriptionsWithSubscriptionCoalescing } from './rpc-subscription-coalescer';

export function createSolanaRpc(config: Omit<Parameters<typeof createJsonRpc>[0], 'api'>): Rpc<SolanaRpcMethods> {
    return createJsonRpc({
        ...config,
        api: createSolanaRpcApi(DEFAULT_RPC_CONFIG),
    });
}

export function createSolanaRpcSubscriptions(
    config: Omit<Parameters<typeof createJsonSubscriptionRpc>[0], 'api'>
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
            })
    );
}

export function createSolanaRpcSubscriptions_UNSTABLE(
    config: Omit<Parameters<typeof createJsonSubscriptionRpc>[0], 'api'>
): RpcSubscriptions<SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable> {
    return createJsonSubscriptionRpc({
        ...config,
        api: createSolanaRpcSubscriptionsApi_UNSTABLE(DEFAULT_RPC_CONFIG),
    });
}
