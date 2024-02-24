import type { Rpc } from '@solana/rpc-spec';
import type { Commitment } from '@solana/rpc-types';

import { GetMinimumBalanceForRentExemptionApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

describe('getMinimumBalanceForRentExemption', () => {
    let rpc: Rpc<GetMinimumBalanceForRentExemptionApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });

    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            it('returns an expected rent amount', async () => {
                expect.assertions(1);
                const result = await rpc.getMinimumBalanceForRentExemption(BigInt(0), { commitment }).send();
                expect(result).toEqual(BigInt(890880));
            });
        });
    });
});
