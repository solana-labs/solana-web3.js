import type { GetAccountInfoApi } from '@solana/rpc-api';
import type { Rpc } from '@solana/rpc-spec';

import { fetchSysvarEpochSchedule, getSysvarEpochScheduleCodec } from '../epoch-schedule';
import { createLocalhostSolanaRpc } from './__setup__';

describe('epoch rewards', () => {
    let rpc: Rpc<GetAccountInfoApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });
    it('decode', () => {
        // prettier-ignore
        const epochScheduleState = new Uint8Array([
            16, 39, 0, 0, 0, 0, 0, 0,       // slotsPerEpoch
            134, 74, 2, 0, 0, 0, 0, 0,      // leaderScheduleSlotOffset
            1,                              // warmup
            38, 2, 0, 0, 0, 0, 0, 0,        // firstNormalEpoch
            128, 147, 220, 20, 0, 0, 0, 0,  // firstNormalSlot
        ]);
        expect(getSysvarEpochScheduleCodec().decode(epochScheduleState)).toMatchObject({
            firstNormalEpoch: 550n,
            firstNormalSlot: 350_000_000n,
            leaderScheduleSlotOffset: 150_150n,
            slotsPerEpoch: 10_000n,
            warmup: true,
        });
    });
    it('fetch', async () => {
        expect.assertions(1);
        const epochSchedule = await fetchSysvarEpochSchedule(rpc);
        expect(epochSchedule).toMatchObject({
            firstNormalEpoch: expect.any(BigInt),
            firstNormalSlot: expect.any(BigInt),
            leaderScheduleSlotOffset: expect.any(BigInt),
            slotsPerEpoch: expect.any(BigInt),
            warmup: expect.any(Boolean),
        });
    });
});
