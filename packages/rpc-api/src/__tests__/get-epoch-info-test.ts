import type { Rpc } from '@solana/rpc-spec';
import { RpcError } from '@solana/rpc-spec-types';
import type { Commitment, SolanaRpcErrorCode } from '@solana/rpc-types';

import { GetEpochInfoApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

describe('getEpochInfo', () => {
    let rpc: Rpc<GetEpochInfoApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });

    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            it('returns epoch info', async () => {
                expect.assertions(1);
                const epochInfoPromise = rpc.getEpochInfo().send();
                await expect(epochInfoPromise).resolves.toStrictEqual({
                    absoluteSlot: expect.any(BigInt),
                    blockHeight: expect.any(BigInt),
                    epoch: expect.any(BigInt),
                    slotIndex: expect.any(BigInt),
                    slotsInEpoch: expect.any(BigInt),
                    transactionCount: expect.any(BigInt),
                });
            });
        });
    });

    describe('when called with a `minContextSlot` higher than the highest slot available', () => {
        it('throws an error', async () => {
            expect.assertions(2);
            const epochInfoPromise = rpc
                .getEpochInfo({
                    minContextSlot: 2n ** 63n - 1n, // u64:MAX; safe bet it'll be too high.
                })
                .send();
            await expect(epochInfoPromise).rejects.toThrow(RpcError);
            await expect(epochInfoPromise).rejects.toMatchObject({
                code: -32016 satisfies (typeof SolanaRpcErrorCode)['JSON_RPC_SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED'],
            });
        });
    });
});
