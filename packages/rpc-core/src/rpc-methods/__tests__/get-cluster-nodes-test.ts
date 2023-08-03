import { createHttpTransport, createJsonRpc } from '@solana/rpc-transport';
import type { Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createSolanaRpcApi, SolanaRpcMethods } from '../index';

describe('getClusterNodes', () => {
    let rpc: Rpc<SolanaRpcMethods>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<SolanaRpcMethods>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
    });

    it('returns the cluster nodes', async () => {
        expect.assertions(1);
        const res = await rpc.getClusterNodes().send();
        // Check that the array contains the expected nodes
        expect(res).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    gossip: '127.0.0.1:1024',
                    rpc: '127.0.0.1:8899',
                    tpu: '127.0.0.1:1026',
                }),
            ])
        );
    });
});
