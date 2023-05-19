import { createSolanaRpcApi, SolanaRpcMethods } from '@solana/rpc-core';
import { createJsonRpc } from '@solana/rpc-transport';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';

import { DEFAULT_RPC_CONFIG } from './rpc-default-config';

export function createSolanaRpc(config: Omit<Parameters<typeof createJsonRpc>[0], 'api'>): Rpc<SolanaRpcMethods> {
    return createJsonRpc<SolanaRpcMethods>({
        ...config,
        api: createSolanaRpcApi(DEFAULT_RPC_CONFIG),
    });
}
