import { base58 } from '@metaplex-foundation/umi-serializers';
import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import validatorIdentityBytes from '../../../../../test-ledger/validator-keypair.json';
import { createSolanaRpcApi, SolanaRpcMethods } from '../index';

describe('getIdentity', () => {
    let rpc: Rpc<SolanaRpcMethods>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<SolanaRpcMethods>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
    });

    it('returns the identity of the currently running local validator', async () => {
        expect.assertions(1);
        const secretKey = new Uint8Array(validatorIdentityBytes);
        const publicKey = secretKey.slice(32, 64);
        const expectedAddress = base58.deserialize(publicKey)[0];
        const identityPromise = rpc.getIdentity().send();
        await expect(identityPromise).resolves.toMatchObject({
            identity: expectedAddress,
        });
    });
});
