import type { GetAccountInfoApi } from '@solana/rpc-api';
import type { Rpc } from '@solana/rpc-spec';

import { fetchSysvarSlotHistory, getSysvarSlotHistoryCodec } from '../slot-history';
import { createLocalhostSolanaRpc } from './__setup__';

const BITVEC_DISCRIMINATOR = 1;
const BITVEC_NUM_BITS = 1024 * 1024;
const BITVEC_LENGTH = BITVEC_NUM_BITS / 64;

describe('slot history', () => {
    let rpc: Rpc<GetAccountInfoApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });
    it('decode', () => {
        const codec = getSysvarSlotHistoryCodec();
        const slotHistoryState = new Uint8Array(codec.fixedSize);
        slotHistoryState.fill(1);
        let offset = 0;
        slotHistoryState.set([BITVEC_DISCRIMINATOR], offset);
        offset += 1;
        slotHistoryState.set([0, 64, 0, 0, 0, 0, 0, 0], offset);
        offset += 8;
        // Let the 1s represent the bits.
        offset += BITVEC_LENGTH * 8;
        slotHistoryState.set([0, 0, 16, 0, 0, 0, 0, 0], offset);
        offset += 8;
        slotHistoryState.set([134, 74, 2, 0, 0, 0, 0, 0], offset);
        expect(codec.decode(slotHistoryState)).toMatchObject({
            bits: expect.arrayContaining([72_340_172_838_076_673n]), // [1, 1, 1, 1, 1, 1, 1, 1]
            nextSlot: 150_150n,
        });
    });
    it('fetch', async () => {
        expect.assertions(1);
        const slotHashes = await fetchSysvarSlotHistory(rpc);
        expect(slotHashes).toMatchObject({
            bits: expect.any(Array),
            nextSlot: expect.any(BigInt),
        });
    });
});
