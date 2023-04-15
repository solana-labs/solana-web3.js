import { SolanaRpcMethods, createSolanaRpcApi } from '@solana/rpc-core';
import { DEFAULT_RPC_CONFIG } from './rpc-default-config';

import { createJsonRpcTransport } from '@solana/rpc-transport';
import type {
    Transport,
    TransportConfig,
} from '@solana/rpc-transport/dist/types/json-rpc-transport/json-rpc-transport-types';

export function createDefaultRpc(config: Omit<TransportConfig<SolanaRpcMethods>, 'api'>): Transport<SolanaRpcMethods> {
    return createJsonRpcTransport({
        ...config,
        api: createSolanaRpcApi(DEFAULT_RPC_CONFIG),
    });
}
