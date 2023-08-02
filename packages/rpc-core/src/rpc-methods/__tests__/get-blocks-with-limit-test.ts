import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createSolanaRpcApi, SolanaRpcMethods } from '../index';

describe('getBlocksWithLimit', () => {
    let rpc: Rpc<SolanaRpcMethods>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<SolanaRpcMethods>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
    });

    describe('when called with a valid `startSlot` and a valid `limit`', () => {
        it('returns 8 blocks for a limit of 8', async () => {
            expect.assertions(1);
            const res = await rpc.getBlocksWithLimit(5n, 8).send();
            expect(res).toHaveLength(8);
        });

        it('returns an empty array for a limit of 0', async () => {
            expect.assertions(1);
            const res = await rpc.getBlocksWithLimit(27n, 0).send();
            expect(res).toHaveLength(0);
        });
    });

    describe('when called with a `limit` resulting in a slot higher than the highest slot available', () => {
        // TODO: We need to be able to deterministically set the highest slot
        // so we can test against it, but without making an RPC call like
        // `getSlot` which would defeat the purpose of this test.
        it.todo('returns up to the highest slot available');
    });

    describe('when called with a `startSlot` higher than the highest slot available', () => {
        it('returns an empty array', async () => {
            expect.assertions(1);
            const res = await rpc
                .getBlocksWithLimit(
                    2n ** 63n - 1n, // u64:MAX; safe bet it'll be too high.
                    3
                )
                .send();
            expect(res).toHaveLength(0);
        });
    });

    describe('when called with a `limit` higher than 500,000', () => {
        it('throws an error', async () => {
            expect.assertions(1);
            const sendPromise = rpc.getBlocksWithLimit(0n, 500_001).send();
            await expect(sendPromise).rejects.toMatchObject({
                code: -32602,
                message: expect.any(String),
                name: 'SolanaJsonRpcError',
            });
        });
    });
});
