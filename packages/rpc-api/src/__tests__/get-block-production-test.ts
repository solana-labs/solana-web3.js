import type { Address } from '@solana/addresses';
import { SOLANA_ERROR__JSON_RPC__INVALID_PARAMS, SolanaError } from '@solana/errors';
import type { Rpc } from '@solana/rpc-spec';
import type { Commitment } from '@solana/rpc-types';

import { GetBlockProductionApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

const CONTEXT_MATCHER = expect.objectContaining({
    slot: expect.any(BigInt),
});

describe('getBlockProduction', () => {
    let rpc: Rpc<GetBlockProductionApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });

    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            it('returns block production data', async () => {
                expect.assertions(1);
                const blockProductionPromise = rpc.getBlockProduction({ commitment }).send();
                await expect(blockProductionPromise).resolves.toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: {
                        // FIXME: https://stackoverflow.com/questions/77204507/how-can-you-match-on-wildcard-object-keys-using-jest-matchers
                        byIdentity: expect.any(Object),
                        range: {
                            firstSlot: expect.any(BigInt),
                            lastSlot: expect.any(BigInt),
                        },
                    },
                });
            });

            it('has the latest context slot as the last slot', async () => {
                expect.assertions(1);
                const blockProduction = await rpc.getBlockProduction({ commitment }).send();
                expect(blockProduction.value.range.lastSlot).toBe(blockProduction.context.slot);
            });
        });
    });

    describe('when called with a single identity', () => {
        // Currently this call always returns just one identity in tests, so no way to meaningfully test this
        it.todo('returns data for just that identity');

        it('returns an empty byIdentity if the identity is not a block producer', async () => {
            expect.assertions(1);
            // Randomly generated address, assumed not to be a block producer
            const identity =
                '9NmqDDZa7mH1DBM4zeq9cm7VcRn2un1i2TwuMvjBoVhU' as Address<'9NmqDDZa7mH1DBM4zeq9cm7VcRn2un1i2TwuMvjBoVhU'>;
            const blockProductionPromise = rpc.getBlockProduction({ identity }).send();
            await expect(blockProductionPromise).resolves.toMatchObject({
                value: {
                    byIdentity: {},
                },
            });
        });
    });

    describe('when called with a `lastSlot` higher than the highest slot available', () => {
        it('throws an error', async () => {
            expect.assertions(3);
            const blockProductionPromise = rpc
                .getBlockProduction({
                    range: {
                        firstSlot: 0n,
                        lastSlot: 2n ** 63n - 1n, // u64:MAX; safe bet it'll be too high.
                    },
                })
                .send();
            await Promise.all([
                expect(blockProductionPromise).rejects.toThrow(SolanaError),
                expect(blockProductionPromise).rejects.toHaveProperty(
                    'context.__code',
                    SOLANA_ERROR__JSON_RPC__INVALID_PARAMS,
                ),
                expect(blockProductionPromise).rejects.toHaveProperty(
                    'context.__serverMessage',
                    expect.stringMatching(/lastSlot, 9223372036854776000, is too large; max \d+/),
                ),
            ]);
        });
    });
});
