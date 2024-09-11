import { createRpc, Rpc } from '@solana/rpc-spec';
import { createHttpTransportForSolanaRpc } from '@solana/rpc-transport-http';

import { createSolanaRpcApi, SolanaRpcApi } from '..';

export function createLocalhostSolanaRpc(): Rpc<SolanaRpcApi> {
    return createRpc({
        api: createSolanaRpcApi(),
        transport: createHttpTransportForSolanaRpc({ url: 'http://127.0.0.1:8899' }),
    });
}
