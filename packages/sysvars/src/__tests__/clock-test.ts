import type { GetAccountInfoApi } from '@solana/rpc-api';
import type { Rpc } from '@solana/rpc-spec';

import { fetchSysvarClock, getSysvarClockCodec } from '../clock';
import { createLocalhostSolanaRpc } from './__setup__';

describe('clock', () => {
    let rpc: Rpc<GetAccountInfoApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });
    it('decode', () => {
        // prettier-ignore
        const clockState = new Uint8Array([
            119, 233, 246, 16, 0, 0, 0, 0,          // slot
            246, 255, 255, 255, 255, 255, 255, 255, // epochStartTimestamp
            4, 0, 0, 0, 0, 0, 0, 0,                 // epoch
            0, 0, 0, 0, 0, 0, 0, 0,                 // leaderScheduleEpoch
            224, 177, 255, 255, 255, 255, 255, 255, // unixTimestamp
        ]);
        expect(getSysvarClockCodec().decode(clockState)).toMatchObject({
            epoch: 4n,
            epochStartTimestamp: -10n,
            leaderScheduleEpoch: 0n,
            slot: 284_617_079n,
            unixTimestamp: -20_000n,
        });
    });
    it('fetch', async () => {
        expect.assertions(1);
        const clock = await fetchSysvarClock(rpc);
        expect(clock).toMatchObject({
            epoch: expect.any(BigInt),
            epochStartTimestamp: expect.any(BigInt),
            leaderScheduleEpoch: expect.any(BigInt),
            slot: expect.any(BigInt),
            unixTimestamp: expect.any(BigInt),
        });
    });
});
