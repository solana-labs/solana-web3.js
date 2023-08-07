import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createSolanaRpcApi, SolanaRpcMethods } from '../index';

describe('getVersion', () => {
    let rpc: Rpc<SolanaRpcMethods>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<SolanaRpcMethods>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
    });

    describe('when called on a valid node', () => {
        it('returns the version', async () => {
            expect.assertions(1);
            const versionPromise = rpc.getVersion().send();
            await expect(versionPromise).resolves.toMatchObject({
                'feature-set': expect.any(Number),
                'solana-core': expect.any(String),
            });
        });
    });
});
