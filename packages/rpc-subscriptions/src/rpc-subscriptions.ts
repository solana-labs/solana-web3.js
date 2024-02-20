import { pipe } from '@solana/functional';
import type { SolanaRpcSubscriptionsApi, SolanaRpcSubscriptionsApiUnstable } from '@solana/rpc-subscriptions-api';
import {
    createSolanaRpcSubscriptionsApi,
    createSolanaRpcSubscriptionsApi_UNSTABLE,
} from '@solana/rpc-subscriptions-api';
import { createSubscriptionRpc, type RpcSubscriptionsTransport } from '@solana/rpc-subscriptions-spec';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import fastStableStringify from 'fast-stable-stringify';

import { DEFAULT_RPC_CONFIG } from './rpc-default-config';
import type { RpcSubscriptionsFromTransport } from './rpc-subscriptions-clusters';
import { getRpcSubscriptionsWithSubscriptionCoalescing } from './rpc-subscriptions-coalescer';

type RpcSubscriptionsConfig<TTransport extends RpcSubscriptionsTransport> = Readonly<{
    transport: TTransport;
}>;

export function createSolanaRpcSubscriptions<TTransport extends RpcSubscriptionsTransport>(
    config: RpcSubscriptionsConfig<TTransport>,
): RpcSubscriptionsFromTransport<SolanaRpcSubscriptionsApi, TTransport> {
    return pipe(
        createSubscriptionRpc({
            ...config,
            api: createSolanaRpcSubscriptionsApi(DEFAULT_RPC_CONFIG),
        }),
        rpcSubscriptions =>
            getRpcSubscriptionsWithSubscriptionCoalescing({
                getDeduplicationKey: (...args) => fastStableStringify(args),
                rpcSubscriptions,
            }),
    ) as RpcSubscriptionsFromTransport<SolanaRpcSubscriptionsApi, TTransport>;
}

export function createSolanaRpcSubscriptions_UNSTABLE<TTransport extends RpcSubscriptionsTransport>(
    config: RpcSubscriptionsConfig<TTransport>,
): RpcSubscriptionsFromTransport<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable, TTransport> {
    return createSubscriptionRpc({
        ...config,
        api: createSolanaRpcSubscriptionsApi_UNSTABLE(DEFAULT_RPC_CONFIG),
    }) as RpcSubscriptionsFromTransport<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable, TTransport>;
}
