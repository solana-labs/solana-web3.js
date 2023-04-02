import { DEFAULT_RPC_CONFIG } from './rpc-default-config';

import { SolanaJsonRpcApi } from '@solana/rpc-core';
import { createJsonRpcTransport } from '@solana/rpc-transport';
import { Transport } from '@solana/rpc-transport/dist/types/json-rpc-transport/json-rpc-transport-types';

export function createDefaultRpc(url: string): Transport<SolanaJsonRpcApi> {
    return createJsonRpcTransport({
        ...DEFAULT_RPC_CONFIG,
        url,
    }) as Transport<SolanaJsonRpcApi>;
}
