import { base58 } from '@metaplex-foundation/umi-serializers';
import { Base58EncodedAddress } from '@solana/keys';
import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { Commitment, LamportsUnsafeBeyond2Pow53Minus1 } from '../common';
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
                const [publicKeyAddress] = base58.deserialize(randomBytes);
                const resultPromise = rpc
                    .requestAirdrop(
                        publicKeyAddress as Base58EncodedAddress,
                        5000000n as LamportsUnsafeBeyond2Pow53Minus1,
                        { commitment }
                    )
                    .send();
                await expect(resultPromise).resolves.toEqual(expect.any(String));
            });
        });
    });
});
