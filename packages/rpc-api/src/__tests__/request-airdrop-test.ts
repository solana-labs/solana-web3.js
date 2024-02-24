import type { Address } from '@solana/addresses';
import { getBase58Decoder } from '@solana/codecs-strings';
import type { Rpc } from '@solana/rpc-spec';
import type { Commitment, LamportsUnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';

import { RequestAirdropApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

describe('requestAirdrop', () => {
    let rpc: Rpc<RequestAirdropApi>;
    beforeEach(() => {
        rpc = createLocalhostSolanaRpc();
    });
    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            it('returns the signature of the airdrop', async () => {
                expect.assertions(1);
                const randomBytes = new Uint8Array(32);
                crypto.getRandomValues(randomBytes);
                const publicKeyAddress = getBase58Decoder().decode(randomBytes);
                const resultPromise = rpc
                    .requestAirdrop(publicKeyAddress as Address, 5000000n as LamportsUnsafeBeyond2Pow53Minus1, {
                        commitment,
                    })
                    .send();
                await expect(resultPromise).resolves.toEqual(expect.any(String));
            });
        });
    });
});
