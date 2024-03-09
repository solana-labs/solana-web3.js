import type { Address } from '@solana/addresses';
import { SOLANA_ERROR__JSON_RPC__INVALID_PARAMS, SolanaError } from '@solana/errors';
import type { Rpc } from '@solana/rpc-spec';
import type { Commitment } from '@solana/rpc-types';

import { GetTokenAccountBalanceApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

const CONTEXT_MATCHER = expect.objectContaining({
    slot: expect.any(BigInt),
});

describe('getTokenAccountBalance', () => {
    let rpc: Rpc<GetTokenAccountBalanceApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });

    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            it('returns token account balance', async () => {
                expect.assertions(1);
                // See scripts/fixtures/spl-token-token-account.json
                const publicKey =
                    'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca' as Address<'AyGCwnwxQMCqaU4ixReHt8h5W4dwmxU7eM3BEQBdWVca'>;
                const tokenAccountBalancePromise = rpc.getTokenAccountBalance(publicKey, { commitment }).send();
                await expect(tokenAccountBalancePromise).resolves.toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: {
                        amount: '9999999779500000',
                        decimals: 6,
                        uiAmount: 9999999779.5,
                        uiAmountString: '9999999779.5',
                    },
                });
            });
        });
    });

    describe('when called with an account that is not a token account', () => {
        it('throws an error', async () => {
            expect.assertions(1);
            const sendPromise = rpc
                .getTokenAccountBalance(
                    // Randomly generated
                    'BnWCFuxmi6uH3ceVx4R8qcbWBMPVVYVVFWtAiiTA1PAu' as Address,
                )
                .send();
            await expect(sendPromise).rejects.toThrow(
                new SolanaError(SOLANA_ERROR__JSON_RPC__INVALID_PARAMS, {
                    __serverMessage: 'Invalid params: missing field `commitment`.',
                }),
            );
        });
    });
});
