import { Address } from '@solana/addresses';
import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { SolanaJsonRpcErrorCode } from '@solana/rpc-transport/dist/types/json-rpc-errors';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createSolanaRpcApi, SolanaRpcMethods } from '../../index';

describe('getSignaturesForAddress', () => {
    let rpc: Rpc<SolanaRpcMethods>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<SolanaRpcMethods>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
    });

    (
        ['confirmed', 'finalized'] as ['confirmed', 'finalized'] as NonNullable<
            Parameters<typeof rpc.getSignaturesForAddress>[1]
        >['commitment'][]
    ).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            it('returns no transactions for a new address', async () => {
                expect.assertions(1);
                // This key is random, don't re-use in any tests that perform transactions
                const publicKey =
                    '3F6rba4VRgdGeYzgCNWQaEJUerUEQVVuwKrETigvHhJP' as Address<'3F6rba4VRgdGeYzgCNWQaEJUerUEQVVuwKrETigvHhJP'>;
                const transactionsPromise = rpc.getSignaturesForAddress(publicKey, { commitment }).send();
                await expect(transactionsPromise).resolves.toEqual([]);
            });
        });
    });

    describe('given an account with transactions', () => {
        // TODO Need to be able to send transactions
        it.todo('returns the transactions for that account');
        it.todo('returns only the first transactions when called with a `limit`');
        it.todo('returns transactions from `since` if defined');
        it.todo('returns transactions only to `until` if defined');
    });

    describe('when called with a `minContextSlot` higher than the highest slot available', () => {
        it('throws an error', async () => {
            expect.assertions(1);
            // This key is random, don't re-use in any tests that perform transactions
            const publicKey = '3F6rba4VRgdGeYzgCNWQaEJUerUEQVVuwKrETigvHhJP' as Address;
            const sendPromise = rpc
                .getSignaturesForAddress(publicKey, {
                    minContextSlot: 2n ** 63n - 1n, // u64:MAX; safe bet it'll be too high.
                })
                .send();
            await expect(sendPromise).rejects.toMatchObject({
                code: -32016 satisfies (typeof SolanaJsonRpcErrorCode)['JSON_RPC_SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED'],
                message: expect.any(String),
                name: 'SolanaJsonRpcError',
            });
        });
    });
});
