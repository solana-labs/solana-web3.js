import { createSolanaRpcApi } from '@solana/rpc-api';
import { createRpc, RpcTransport } from '@solana/rpc-spec';

import type { RpcFromTransport, SolanaRpcApiFromTransport } from './rpc-clusters';
import { DEFAULT_RPC_CONFIG } from './rpc-default-config';

type RpcConfig<TTransport extends RpcTransport> = Readonly<{
    transport: TTransport;
}>;

export function createSolanaRpc<TTransport extends RpcTransport>(
    config: RpcConfig<TTransport>,
): RpcFromTransport<SolanaRpcApiFromTransport<TTransport>, TTransport> {
    const api = createSolanaRpcApi<SolanaRpcApiFromTransport<TTransport>>(DEFAULT_RPC_CONFIG);
    return createRpc({ ...config, api }) as RpcFromTransport<SolanaRpcApiFromTransport<TTransport>, TTransport>;
}
