import { SOLANA_ERROR__JSON_RPC__SERVER_ERROR_BLOCK_NOT_AVAILABLE, SolanaError } from '@solana/errors';
import type { Rpc } from '@solana/rpc-spec';

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
            expect.assertions(1);
            const blockNumber = 2n ** 63n - 1n; // u64:MAX; safe bet it'll be too high.
            const blockTimePromise = rpc.getBlockTime(blockNumber).send();
            await expect(blockTimePromise).rejects.toThrow(
                new SolanaError(SOLANA_ERROR__JSON_RPC__SERVER_ERROR_BLOCK_NOT_AVAILABLE, {
                    __serverMessage: 'Block not available for slot 9223372036854776000',
                }),
            );
        });
    });
});
