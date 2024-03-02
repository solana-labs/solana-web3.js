import { createSolanaRpcApi } from '@solana/rpc-api';
import { createRpc, RpcTransport } from '@solana/rpc-spec';
import { ClusterUrl } from '@solana/rpc-types';

import type { RpcFromTransport, SolanaRpcApiFromTransport } from './rpc-clusters';
import { DEFAULT_RPC_CONFIG } from './rpc-default-config';
import { createDefaultRpcTransport, DefaultRpcTransportConfig } from './rpc-transport';

/** Creates a new Solana RPC using the default decorated HTTP transport. */
export function createSolanaRpc<TClusterUrl extends ClusterUrl>(
    clusterUrl: TClusterUrl,
    config?: Omit<DefaultRpcTransportConfig<TClusterUrl>, 'url'>,
) {
    return createSolanaRpcFromTransport(createDefaultRpcTransport({ url: clusterUrl, ...config }));
}

/** Creates a new Solana RPC using a custom transport. */
export function createSolanaRpcFromTransport<TTransport extends RpcTransport>(transport: TTransport) {
    return createRpc({
        api: createSolanaRpcApi(DEFAULT_RPC_CONFIG),
        transport,
    }) as RpcFromTransport<SolanaRpcApiFromTransport<TTransport>, TTransport>;
}
