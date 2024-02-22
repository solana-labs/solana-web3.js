import type { Rpc } from '@solana/rpc-spec';
import { RpcError } from '@solana/rpc-spec-types';
import type { Commitment, SolanaRpcErrorCode } from '@solana/rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { GetLatestBlockhashApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

const CONTEXT_MATCHER = expect.objectContaining({
    slot: expect.any(BigInt),
});

describe('getLatestBlockhash', () => {
    let rpc: Rpc<GetLatestBlockhashApi>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createLocalhostSolanaRpc();
    });

    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            it('returns the blockhash and block height', async () => {
                expect.assertions(1);
                const blockhashPromise = rpc.getLatestBlockhash({ commitment }).send();
                await expect(blockhashPromise).resolves.toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: {
                        blockhash: expect.any(String),
                        lastValidBlockHeight: expect.any(BigInt),
                    },
                });
            });
        });
    });

    describe('when called with a `minContextSlot` higher than the highest slot available', () => {
        it('throws an error', async () => {
            expect.assertions(2);
            const sendPromise = rpc
                .getLatestBlockhash({
                    minContextSlot: 2n ** 63n - 1n, // u64:MAX; safe bet it'll be too high.
                })
                .send();
            await expect(sendPromise).rejects.toThrow(RpcError);
            await expect(sendPromise).rejects.toMatchObject({
                code: -32016 satisfies (typeof SolanaRpcErrorCode)['JSON_RPC_SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED'],
            });
        });
    });
});
