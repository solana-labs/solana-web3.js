import type { GetAccountInfoApi } from '@solana/rpc-api';
import type { Rpc } from '@solana/rpc-spec';

import { fetchSysvarLastRestartSlot, getSysvarLastRestartSlotCodec } from '../last-restart-slot';
import { createLocalhostSolanaRpc } from './__setup__';

describe('last restart slot', () => {
    let rpc: Rpc<GetAccountInfoApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });
    it('decode', () => {
        const lastRestartSlotState = new Uint8Array([119, 233, 246, 16, 0, 0, 0, 0]);
        expect(getSysvarLastRestartSlotCodec().decode(lastRestartSlotState)).toMatchObject({
            lastRestartSlot: 284_617_079n,
        });
    });
    it('fetch', async () => {
        expect.assertions(1);
        const lastRestartSlot = await fetchSysvarLastRestartSlot(rpc);
        expect(lastRestartSlot).toMatchObject({
            lastRestartSlot: expect.any(BigInt),
        });
    });
});
