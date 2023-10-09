import { SolanaRpcMethods } from '@solana/rpc-core';
import { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';

import { createGraphQLCache, GraphQLCache } from './cache';

export interface RpcGraphQLContext {
    cache: GraphQLCache;
    rpc: Rpc<SolanaRpcMethods>;
}

export function createSolanaGraphQLContext(rpc: Rpc<SolanaRpcMethods>): RpcGraphQLContext {
    const cache = createGraphQLCache();
    return { cache, rpc };
}
