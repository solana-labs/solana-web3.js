import type { Rpc } from '@solana/rpc-spec';

import { MinimumLedgerSlotApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

describe('minimumLedgerSlot', () => {
    let rpc: Rpc<MinimumLedgerSlotApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });
    describe('when called with no parameters', () => {
        it('returns a bigint', async () => {
            expect.assertions(1);
            const result = await rpc.minimumLedgerSlot().send();
            expect(result).toEqual(expect.any(BigInt));
        });
    });
});
