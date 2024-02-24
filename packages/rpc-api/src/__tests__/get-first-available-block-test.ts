import type { Rpc } from '@solana/rpc-spec';

import { GetFirstAvailableBlockApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

describe('getFirstAvailableBlock', () => {
    let rpc: Rpc<GetFirstAvailableBlockApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });
    describe('when called with no parameters', () => {
        it('returns a bigint', async () => {
            expect.assertions(1);
            const result = await rpc.getFirstAvailableBlock().send();
            expect(result).toEqual(expect.any(BigInt));
        });
    });
});
