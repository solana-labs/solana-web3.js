import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { SolanaJsonRpcErrorCode } from '@solana/rpc-transport/dist/types/json-rpc-errors';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createSolanaRpcApi, SolanaRpcMethods } from '../index';

describe('getSlotLeaders', () => {
    let rpc: Rpc<SolanaRpcMethods>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<SolanaRpcMethods>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
    });

    describe('when called with a valid slot', () => {
        it('returns the node public keys', async () => {
            expect.assertions(2);
            const minimumLedgerSlot = (await rpc.minimumLedgerSlot().send()) as bigint;

            const result = await rpc.getSlotLeaders(minimumLedgerSlot, 3).send();
            expect(Array.isArray(result)).toBe(true);
            expect(typeof result[0]).toBe('string');
        });
    });

    describe('when called with a `startSlot` higher than the highest slot available', () => {
        it('throws an error', async () => {
            expect.assertions(1);
            const sendPromise = rpc
                .getSlotLeaders(
                    2n ** 63n - 1n, // u64:MAX; safe bet it'll be too high.
                    3
                )
                .send();
            await expect(sendPromise).rejects.toMatchObject({
                code: -32602 satisfies (typeof SolanaJsonRpcErrorCode)['JSON_RPC_INVALID_PARAMS'],
                message: expect.any(String),
                name: 'SolanaJsonRpcError',
            });
        });
    });

    describe('when called with a `limit` greater than 5000', () => {
        it('throws an error', async () => {
            expect.assertions(1);
            const minimumLedgerSlot = (await rpc.minimumLedgerSlot().send()) as bigint;

            const sendPromise = rpc.getSlotLeaders(minimumLedgerSlot, 5001).send();
            await expect(sendPromise).rejects.toMatchObject({
                code: -32602 satisfies (typeof SolanaJsonRpcErrorCode)['JSON_RPC_INVALID_PARAMS'],
                message: expect.any(String),
                name: 'SolanaJsonRpcError',
            });
        });
    });
});
