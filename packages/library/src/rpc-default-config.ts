import { SolanaJsonRpcIntegerOverflowError } from './rpc-integer-overflow-error';

import { createJsonRpcTransport } from '@solana/rpc-transport';

export const DEFAULT_RPC_CONFIG: Partial<Parameters<typeof createJsonRpcTransport>[0]> = {
    onIntegerOverflow(...args) {
        throw new SolanaJsonRpcIntegerOverflowError(...args);
    },
};
