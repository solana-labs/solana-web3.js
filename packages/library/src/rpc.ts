import { SolanaRpcMethods, createSolanaRpcApi } from '@solana/rpc-core';
import { DEFAULT_RPC_CONFIG } from './rpc-default-config';

import { createJsonRpcTransport } from '@solana/rpc-transport';
import type { Transport } from '@solana/rpc-transport/dist/types/json-rpc-transport/json-rpc-transport-types';

export function createDefaultRpc(url: string): Transport<SolanaRpcMethods> {
    return createJsonRpcTransport({
        api: createSolanaRpcApi(DEFAULT_RPC_CONFIG),
        url,
    });
}
