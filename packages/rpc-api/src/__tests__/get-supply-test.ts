import type { Rpc } from '@solana/rpc-spec';
import type { Commitment } from '@solana/rpc-types';

import { GetSupplyApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

const CONTEXT_MATCHER = expect.objectContaining({
    slot: expect.any(BigInt),
});

describe('getSupply', () => {
    let rpc: Rpc<GetSupplyApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });

    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            it('returns the supply', async () => {
                expect.assertions(1);
                const supply = await rpc.getSupply({ commitment }).send();

                expect(supply).toStrictEqual({
                    context: CONTEXT_MATCHER,
                    value: {
                        circulating: expect.any(BigInt),
                        nonCirculating: expect.any(BigInt),
                        nonCirculatingAccounts: expect.arrayContaining([expect.any(String)]),
                        total: expect.any(BigInt),
                    },
                });

                // TODO: we don't reliably have non-circulating accounts in test validator yet
                // expect(supply.value.nonCirculatingAccounts.length).toBeGreaterThan(0);
            });
        });
    });

    describe('when called with `excludeNonCirculatingAccountsList: true`', () => {
        it.todo('returns an empty `nonCirculatingAccounts` array');
    });

    describe('when called with `excludeNonCirculatingAccountsList: false`', () => {
        it.todo('returns a non-empty `nonCirculatingAccounts` array');
    });
});
