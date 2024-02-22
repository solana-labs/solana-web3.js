import type { Rpc } from '@solana/rpc-spec';
import type { SolanaRpcErrorCode } from '@solana/rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { GetHealthApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

describe('getHealth', () => {
    let rpc: Rpc<GetHealthApi>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createLocalhostSolanaRpc();
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
                name: 'RpcError',
            };
            fetchMock.mockRejectOnce(errorObject);
            const healthPromise = rpc.getHealth().send();
            await expect(healthPromise).rejects.toMatchObject({
                code: errorCode satisfies (typeof SolanaRpcErrorCode)['JSON_RPC_SERVER_ERROR_NODE_UNHEALTHY'],
                message: errorMessage,
                name: 'RpcError',
            });
        });
    });
});
