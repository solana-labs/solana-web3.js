import type { Rpc } from '@solana/rpc-spec';
import { RpcError } from '@solana/rpc-spec-types';
import type { SolanaRpcErrorCode } from '@solana/rpc-types';

import { GetBlockTimeApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

describe('getBlockTime', () => {
    let rpc: Rpc<GetBlockTimeApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });

    describe('when called with a currently available block', () => {
        // TODO: either use getFirstAvailableBlock when implemented, or we'll need a way to control the ledger
        it.todo('returns a block time');
    });

    describe('when called with a block that has been cleaned up', () => {
        // TODO: will need a way to control the ledger and get a past block that has been cleaned up
        // Expected error:
        /*
    "error": {
      "code": -32001,
      "message": "Block 150 cleaned up, does not exist on node. First available block: 141077"
    }
    */
        it.todo('returns an error');
    });

    describe('when called with a block higher than the highest block available', () => {
        it('throws an error', async () => {
            expect.assertions(2);
            const blockNumber = 2n ** 63n - 1n; // u64:MAX; safe bet it'll be too high.
            const blockTimePromise = rpc.getBlockTime(blockNumber).send();
            await expect(blockTimePromise).rejects.toThrow(RpcError);
            await expect(blockTimePromise).rejects.toMatchObject({
                code: -32004 satisfies (typeof SolanaRpcErrorCode)['JSON_RPC_SERVER_ERROR_BLOCK_NOT_AVAILABLE'],
            });
        });
    });
});
