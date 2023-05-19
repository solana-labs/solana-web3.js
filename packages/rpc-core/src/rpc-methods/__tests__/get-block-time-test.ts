import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { SolanaJsonRpcErrorCode } from '@solana/rpc-transport/dist/types/json-rpc-errors';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createSolanaRpcApi, SolanaRpcMethods } from '../index';

describe('getBlockTime', () => {
    let rpc: Rpc<SolanaRpcMethods>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<SolanaRpcMethods>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
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
            await expect(blockTimePromise).rejects.toMatchObject({
                code: -32004 satisfies (typeof SolanaJsonRpcErrorCode)['JSON_RPC_SERVER_ERROR_BLOCK_NOT_AVAILABLE'],
                message: expect.any(String),
                name: 'SolanaJsonRpcError',
            });
        });
    });
});
