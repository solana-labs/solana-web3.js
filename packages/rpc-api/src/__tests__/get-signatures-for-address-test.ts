import type { Address } from '@solana/addresses';
import { SOLANA_ERROR__JSON_RPC__SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED, SolanaError } from '@solana/errors';
import type { Rpc } from '@solana/rpc-spec';

import { GetSignaturesForAddressApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

describe('getSignaturesForAddress', () => {
    let rpc: Rpc<GetSignaturesForAddressApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
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
            expect.assertions(3);
            // This key is random, don't re-use in any tests that perform transactions
            const publicKey = '3F6rba4VRgdGeYzgCNWQaEJUerUEQVVuwKrETigvHhJP' as Address;
            const sendPromise = rpc
                .getSignaturesForAddress(publicKey, {
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
