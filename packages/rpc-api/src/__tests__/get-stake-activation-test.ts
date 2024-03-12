import type { Address } from '@solana/addresses';
import {
    SOLANA_ERROR__JSON_RPC__INVALID_PARAMS,
    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED,
    SolanaError,
} from '@solana/errors';
import type { Rpc } from '@solana/rpc-spec';
import type { Commitment } from '@solana/rpc-types';

import { GetStakeActivationApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

// See scripts/fixtures/stake-account.json
const stakeAccountAddress = 'CSg2vQGbnwWdSyJpwK4i3qGfB6FebaV3xQTx4U1MbixN' as Address;

describe('getStakeActivation', () => {
    let rpc: Rpc<GetStakeActivationApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });

    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            it('returns stake activation', async () => {
                expect.assertions(1);
                const stakeActivationPromise = rpc.getStakeActivation(stakeAccountAddress, { commitment }).send();
                await expect(stakeActivationPromise).resolves.toStrictEqual({
                    active: expect.any(BigInt),
                    inactive: expect.any(BigInt),
                    state: expect.any(String),
                });
            });
        });
    });

    describe('when called with an account that is not a stake account', () => {
        it('throws an error', async () => {
            expect.assertions(1);
            const stakeActivationPromise = rpc
                .getStakeActivation(
                    // Randomly generated
                    'BnWCFuxmi6uH3ceVx4R8qcbWBMPVVYVVFWtAiiTA1PAu' as Address,
                )
                .send();
            await expect(stakeActivationPromise).rejects.toThrow(
                new SolanaError(SOLANA_ERROR__JSON_RPC__INVALID_PARAMS, {
                    __serverMessage: 'Invalid param: account not found',
                }),
            );
        });
    });

    describe('when called with a `minContextSlot` higher than the highest slot available', () => {
        it('throws an error', async () => {
            expect.assertions(3);
            const stakeActivationPromise = rpc
                .getStakeActivation(stakeAccountAddress, {
                    minContextSlot: 2n ** 63n - 1n, // u64:MAX; safe bet it'll be too high.
                })
                .send();
            await Promise.all([
                expect(stakeActivationPromise).rejects.toThrow(SolanaError),
                expect(stakeActivationPromise).rejects.toHaveProperty(
                    'context.__code',
                    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED,
                ),
                expect(stakeActivationPromise).rejects.toHaveProperty('context.contextSlot', expect.any(Number)),
            ]);
        });
    });

    describe('when called with an `epoch` higher than the highest slot available', () => {
        it('throws an error', async () => {
            expect.assertions(1);
            const stakeActivationPromise = rpc
                .getStakeActivation(stakeAccountAddress, {
                    epoch: 2n ** 63n - 1n, // u64:MAX; safe bet it'll be too high.
                })
                .send();
            await expect(stakeActivationPromise).rejects.toThrow(
                new SolanaError(SOLANA_ERROR__JSON_RPC__INVALID_PARAMS, {
                    __serverMessage:
                        'Invalid param: epoch 9223372036854776000. Only the current epoch (0) is supported',
                }),
            );
        });
    });
});
