import { Address } from '@solana/addresses';
import { getBase58Decoder } from '@solana/codecs-strings';
import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import { Commitment, LamportsUnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createSolanaRpcApi, SolanaRpcMethods } from '../index';

describe('requestAirdrop', () => {
    let rpc: Rpc<SolanaRpcMethods>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<SolanaRpcMethods>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
    });
    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            it('returns the signature of the airdrop', async () => {
                expect.assertions(1);
                const randomBytes = new Uint8Array(32);
                crypto.getRandomValues(randomBytes);
                const [publicKeyAddress] = getBase58Decoder().decode(randomBytes);
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
