import type { GetAccountInfoApi } from '@solana/rpc-api';
import type { Rpc } from '@solana/rpc-spec';

import { fetchSysvarStakeHistory, getSysvarStakeHistoryCodec } from '../stake-history';
import { createLocalhostSolanaRpc } from './__setup__';

describe('stake history', () => {
    let rpc: Rpc<GetAccountInfoApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });
    it('decode', () => {
        // prettier-ignore
        const stakeHistoryState = new Uint8Array([
            2, 0, 0, 0,                     // array length 
            0, 208, 237, 144, 46, 0, 0, 0,  // effective
            0, 160, 219, 33, 93, 0, 0, 0,   // activating
            0, 112, 201, 178, 139, 0, 0, 0, // deactivating
            0, 160, 219, 33, 93, 0, 0, 0,   // effective
            0, 112, 201, 178, 139, 0, 0, 0, // activating
            0, 64, 183, 67, 186, 0, 0, 0,   // deactivating
        ]);
        expect(getSysvarStakeHistoryCodec().decode(stakeHistoryState)).toMatchObject(
            expect.arrayContaining([
                {
                    activating: 400_000_000_000n,
                    deactivating: 600_000_000_000n,
                    effective: 200_000_000_000n,
                },
                {
                    activating: 600_000_000_000n,
                    deactivating: 800_000_000_000n,
                    effective: 400_000_000_000n,
                },
            ]),
        );
    });
    it('fetch', async () => {
        expect.assertions(1);
        const stakeHistory = await fetchSysvarStakeHistory(rpc);
        expect(stakeHistory).toMatchObject(expect.any(Array)); // Not always populated on test validator
    });
});
