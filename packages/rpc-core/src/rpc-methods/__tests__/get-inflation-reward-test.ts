import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { SolanaJsonRpcErrorCode } from '@solana/rpc-transport/dist/types/json-rpc-errors';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import { Commitment } from '@solana/rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createSolanaRpcApi, SolanaRpcMethods } from '../index';

describe('getInflationReward', () => {
    let rpc: Rpc<SolanaRpcMethods>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<SolanaRpcMethods>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
    });
    [{ minContextSlot: 0n }, null].forEach(minContextConfig => {
        describe(`when called with ${
            minContextConfig ? `a \`minContextSlot\` of ${minContextConfig.minContextSlot}` : 'no `minContextSlot`'
        }`, () => {
            (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
                describe(`when called with \`${commitment}\` commitment`, () => {
                    // TODO(#1240) Figure out a way to write tests for these.
                    // * Need to be able to fast-forward the validator to have at least one epoch.
                    // * Need to prepare a fixture address that is owed an inflation/staking reward.
                    it.todo('returns null for an address expected to have no inflation rewards');
                    it.todo('returns the inflation reward details for an address expected to have an inflation reward');
                });
            });
        });
    });
    describe('when called with an `epoch` higher than the highest epoch available', () => {
        it('throws an error', async () => {
            expect.assertions(1);
            const sendPromise = rpc
                .getInflationReward([], {
                    epoch: 2n ** 63n - 1n, // u64:MAX; safe bet it'll be too high.
                })
                .send();
            await expect(sendPromise).rejects.toMatchObject({
                code: -32004 satisfies (typeof SolanaJsonRpcErrorCode)['JSON_RPC_SERVER_ERROR_BLOCK_NOT_AVAILABLE'],
                message: expect.any(String),
                name: 'SolanaJsonRpcError',
            });
        });
    });
    describe('when called with a `minContextSlot` higher than the highest slot available', () => {
        it('throws an error', async () => {
            expect.assertions(1);
            const sendPromise = rpc
                .getInflationReward([], {
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
