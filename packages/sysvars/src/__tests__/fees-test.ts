import type { GetAccountInfoApi } from '@solana/rpc-api';
import type { Rpc } from '@solana/rpc-spec';

import { fetchSysvarFees, getSysvarFeesCodec } from '../fees';
import { createLocalhostSolanaRpc } from './__setup__';

describe('fees', () => {
    let rpc: Rpc<GetAccountInfoApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });
    it('decode', () => {
        const feesState = new Uint8Array([0, 225, 245, 5, 0, 0, 0, 0]);
        expect(getSysvarFeesCodec().decode(feesState)).toMatchObject({
            feeCalculator: {
                lamportsPerSignature: 100_000_000n,
            },
        });
    });
    it('fetch', async () => {
        expect.assertions(1);
        const fees = await fetchSysvarFees(rpc);
        expect(fees).toMatchObject({
            feeCalculator: {
                lamportsPerSignature: expect.any(BigInt),
            },
        });
    });
});
