import { SolanaRpcMethods } from '@solana/rpc-core';
import { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';

export interface RpcGraphQLContext {
    rpc: Rpc<SolanaRpcMethods>;
}

export function createSolanaGraphQLContext(rpc: Rpc<SolanaRpcMethods>): RpcGraphQLContext {
    return { rpc };
}
