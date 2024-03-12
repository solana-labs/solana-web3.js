import type { GetAccountInfoApi } from '@solana/rpc-api';
import type { Rpc } from '@solana/rpc-spec';

import { fetchSysvarRecentBlockhashes, getSysvarRecentBlockhashesCodec } from '../recent-blockhashes';
import { createLocalhostSolanaRpc } from './__setup__';

describe('recent blockhashes', () => {
    let rpc: Rpc<GetAccountInfoApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });
    it('decode', () => {
        // prettier-ignore
        const recentBlockhashesState = new Uint8Array([
            2, 0, 0, 0,                 // array length 
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            134, 74, 2, 0, 0, 0, 0, 0,  // lamportsPerSignature
            2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
            134, 74, 2, 0, 0, 0, 0, 0,  // lamportsPerSignature
        ]);
        expect(getSysvarRecentBlockhashesCodec().decode(recentBlockhashesState)).toMatchObject([
            {
                blockhash: '4vJ9JU1bJJE96FWSJKvHsmmFADCg4gpZQff4P3bkLKi',
                feeCalculator: {
                    lamportsPerSignature: 150_150n,
                },
            },
            {
                blockhash: '8qbHbw2BbbTHBW1sbeqakYXVKRQM8Ne7pLK7m6CVfeR',
                feeCalculator: {
                    lamportsPerSignature: 150_150n,
                },
            },
        ]);
    });
    it('fetch', async () => {
        expect.assertions(1);
        const recentBlockhashes = await fetchSysvarRecentBlockhashes(rpc);
        expect(recentBlockhashes).toMatchObject(
            expect.arrayContaining([
                {
                    blockhash: expect.any(String),
                    feeCalculator: {
                        lamportsPerSignature: expect.any(BigInt),
                    },
                },
            ]),
        );
    });
});
