import type { Address } from '@solana/addresses';
import type { Rpc } from '@solana/rpc-spec';
import { RpcError } from '@solana/rpc-spec-types';
import type { Commitment, SolanaRpcErrorCode } from '@solana/rpc-types';

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
            expect.assertions(2);
            const stakeActivationPromise = rpc
                .getStakeActivation(
                    // Randomly generated
                    'BnWCFuxmi6uH3ceVx4R8qcbWBMPVVYVVFWtAiiTA1PAu' as Address,
                )
                .send();
            await expect(stakeActivationPromise).rejects.toThrow(RpcError);
            await expect(stakeActivationPromise).rejects.toMatchObject({
                code: -32602 satisfies (typeof SolanaRpcErrorCode)['JSON_RPC_INVALID_PARAMS'],
            });
        });
    });

    describe('when called with a `minContextSlot` higher than the highest slot available', () => {
        it('throws an error', async () => {
            expect.assertions(2);
            const stakeActivationPromise = rpc
                .getStakeActivation(stakeAccountAddress, {
                    minContextSlot: 2n ** 63n - 1n, // u64:MAX; safe bet it'll be too high.
                })
                .send();
            await expect(stakeActivationPromise).rejects.toThrow(RpcError);
            await expect(stakeActivationPromise).rejects.toMatchObject({
                code: -32016 satisfies (typeof SolanaRpcErrorCode)['JSON_RPC_SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED'],
            });
        });
    });

    describe('when called with an `epoch` higher than the highest slot available', () => {
        it('throws an error', async () => {
            expect.assertions(2);
            const stakeActivationPromise = rpc
                .getStakeActivation(stakeAccountAddress, {
                    epoch: 2n ** 63n - 1n, // u64:MAX; safe bet it'll be too high.
                })
                .send();
            await expect(stakeActivationPromise).rejects.toThrow(RpcError);
            await expect(stakeActivationPromise).rejects.toMatchObject({
                code: -32602 satisfies (typeof SolanaRpcErrorCode)['JSON_RPC_INVALID_PARAMS'],
            });
        });
    });
});
