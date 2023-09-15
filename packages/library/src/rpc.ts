import {
    createSolanaRpcApi,
    createSolanaRpcSubscriptionsApi,
    SolanaRpcMethods,
    SolanaRpcSubscriptions,
} from '@solana/rpc-core';
import { createJsonRpc, createJsonSubscriptionRpc } from '@solana/rpc-transport';
import type { Rpc, RpcSubscriptions } from '@solana/rpc-transport/dist/types/json-rpc-types';

import { DEFAULT_RPC_CONFIG } from './rpc-default-config';

export function createSolanaRpc(config: Omit<Parameters<typeof createJsonRpc>[0], 'api'>): Rpc<SolanaRpcMethods> {
    return createJsonRpc({
        ...config,
        api: createSolanaRpcApi(DEFAULT_RPC_CONFIG),
    });
}

export function createSolanaRpcSubscriptions(
    config: Omit<Parameters<typeof createJsonSubscriptionRpc>[0], 'api'>
): RpcSubscriptions<SolanaRpcSubscriptions> {
    return createJsonSubscriptionRpc({
        ...config,
        api: createSolanaRpcSubscriptionsApi(DEFAULT_RPC_CONFIG),
    });
}
