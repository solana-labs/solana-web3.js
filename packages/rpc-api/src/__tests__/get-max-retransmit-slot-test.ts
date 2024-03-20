import type { Rpc } from '@solana/rpc-spec';

import { GetMaxRetransmitSlotApi } from '../index.js';
import { createLocalhostSolanaRpc } from './__setup__.js';

describe('getMaxRetransmitSlot', () => {
    let rpc: Rpc<GetMaxRetransmitSlotApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });
    describe('when called with no parameters', () => {
        it('returns a bigint', async () => {
            expect.assertions(1);
            const result = await rpc.getMaxRetransmitSlot().send();
            expect(result).toEqual(expect.any(BigInt));
        });
    });
});
