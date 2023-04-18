import { SolanaRpcMethods, createSolanaRpcApi } from '@solana/rpc-core';
import { DEFAULT_RPC_CONFIG } from './rpc-default-config';

import { createJsonRpc } from '@solana/rpc-transport';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';

export function createSolanaRpc(config: Omit<Parameters<typeof createJsonRpc>[0], 'api'>): Rpc<SolanaRpcMethods> {
    return createJsonRpc<SolanaRpcMethods>({
        ...config,
        api: createSolanaRpcApi(DEFAULT_RPC_CONFIG),
    });
}
