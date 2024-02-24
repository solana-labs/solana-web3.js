import type { Rpc } from '@solana/rpc-spec';

import { GetEpochScheduleApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

describe('getEpochSchedule', () => {
    let rpc: Rpc<GetEpochScheduleApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });

    it('returns the epoch schedule', async () => {
        expect.assertions(1);
        const epochSchedulePromise = rpc.getEpochSchedule().send();
        await expect(epochSchedulePromise).resolves.toStrictEqual({
            firstNormalEpoch: expect.any(BigInt),
            firstNormalSlot: expect.any(BigInt),
            leaderScheduleSlotOffset: expect.any(BigInt),
            slotsPerEpoch: expect.any(BigInt),
            warmup: expect.any(Boolean),
        });
    });
});
