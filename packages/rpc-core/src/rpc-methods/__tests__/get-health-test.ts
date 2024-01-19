import { createHttpTransport, createJsonRpc, type SolanaJsonRpcErrorCode } from '@solana/rpc-transport';
import type { Rpc } from '@solana/rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createSolanaRpcApi, GetHealthApi } from '../index';

describe('getHealth', () => {
    let rpc: Rpc<GetHealthApi>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<GetHealthApi>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
    });

    describe('when the node is healthy', () => {
        it('returns "ok"', async () => {
            expect.assertions(1);
            const healthPromise = rpc.getHealth().send();
            await expect(healthPromise).resolves.toBe('ok');
        });
    });

    describe('when the node is unhealthy', () => {
        it('returns an error message', async () => {
            expect.assertions(1);
            const errorMessage = 'Node is unhealthy';
            const errorCode = -32005;
            const errorObject = {
                code: errorCode,
                message: errorMessage,
                name: 'SolanaJsonRpcError',
            };
            fetchMock.mockRejectOnce(errorObject);
            const healthPromise = rpc.getHealth().send();
            await expect(healthPromise).rejects.toMatchObject({
                code: errorCode satisfies (typeof SolanaJsonRpcErrorCode)['JSON_RPC_SERVER_ERROR_NODE_UNHEALTHY'],
                message: errorMessage,
                name: 'SolanaJsonRpcError',
            });
        });
    });
});
