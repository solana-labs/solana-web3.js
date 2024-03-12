import type { Address } from '@solana/addresses';
import { SOLANA_ERROR__JSON_RPC__SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED, SolanaError } from '@solana/errors';
import type { Rpc } from '@solana/rpc-spec';
import type { Commitment } from '@solana/rpc-types';

import { GetBalanceApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

describe('getBalance', () => {
    let rpc: Rpc<GetBalanceApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });

    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            it('returns a balance of zero for a new address', async () => {
                expect.assertions(1);
                // This key is random, don't re-use in any tests that affect balance
                const publicKey =
                    '4BfxgLzn6pEuVB2ynBMqckHFdYD8VNcrheDFFCB6U5TH' as Address<'4BfxgLzn6pEuVB2ynBMqckHFdYD8VNcrheDFFCB6U5TH'>;
                const balancePromise = rpc.getBalance(publicKey).send();
                await expect(balancePromise).resolves.toHaveProperty('value', BigInt(0));
            });
        });
    });

    describe('given an account with a non-zero balance', () => {
        // See scripts/fixtures/4nTLDQiSTRHbngKZWPMfYnZdWTbKiNeuuPcX7yFUpSAc.json
        const publicKey =
            '4nTLDQiSTRHbngKZWPMfYnZdWTbKiNeuuPcX7yFUpSAc' as Address<'4nTLDQiSTRHbngKZWPMfYnZdWTbKiNeuuPcX7yFUpSAc'>;
        it('returns the correct balance', async () => {
            expect.assertions(1);
            const balancePromise = rpc.getBalance(publicKey).send();
            await expect(balancePromise).resolves.toHaveProperty('value', BigInt(5_000_000));
        });
    });

    describe('when called with a `minContextSlot` higher than the highest slot available', () => {
        it('throws an error', async () => {
            expect.assertions(3);
            // This key is random, don't re-use in any tests that affect balance
            const publicKey =
                '4BfxgLzn6pEuVB2ynBMqckHFdYD8VNcrheDFFCB6U5TH' as Address<'4BfxgLzn6pEuVB2ynBMqckHFdYD8VNcrheDFFCB6U5TH'>;
            const sendPromise = rpc
                .getBalance(publicKey, {
                    minContextSlot: 2n ** 63n - 1n, // u64:MAX; safe bet it'll be too high.
                })
                .send();
            await Promise.all([
                expect(sendPromise).rejects.toThrow(SolanaError),
                expect(sendPromise).rejects.toHaveProperty(
                    'context.__code',
                    SOLANA_ERROR__JSON_RPC__SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED,
                ),
                expect(sendPromise).rejects.toHaveProperty('context.contextSlot', expect.any(Number)),
            ]);
        });
    });
});
