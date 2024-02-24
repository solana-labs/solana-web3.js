import { createRpc, type Rpc } from '@solana/rpc-spec';
import type { SolanaRpcErrorCode } from '@solana/rpc-types';

import { createSolanaRpcApi, GetHealthApi } from '../index';
import { createLocalhostSolanaRpc } from './__setup__';

describe('getHealth', () => {
    describe('when the node is healthy', () => {
        let rpc: Rpc<GetHealthApi>;
        beforeEach(() => {
            rpc = createLocalhostSolanaRpc();
        });
        it('returns "ok"', async () => {
            expect.assertions(1);
            const healthPromise = rpc.getHealth().send();
            await expect(healthPromise).resolves.toBe('ok');
        });
    });

    describe('when the node is unhealthy', () => {
        let rpc: Rpc<GetHealthApi>;
        const errorMessage = 'Node is unhealthy';
        const errorCode = -32005;
        const errorObject = {
            code: errorCode,
            message: errorMessage,
            name: 'RpcError',
        };
        beforeEach(() => {
            rpc = createRpc({
                api: createSolanaRpcApi(),
                transport: jest.fn().mockRejectedValue(errorObject),
            });
        });
        it('returns an error message', async () => {
            expect.assertions(1);
            const healthPromise = rpc.getHealth().send();
            await expect(healthPromise).rejects.toMatchObject({
                code: errorCode satisfies (typeof SolanaRpcErrorCode)['JSON_RPC_SERVER_ERROR_NODE_UNHEALTHY'],
                message: errorMessage,
                name: 'RpcError',
            });
        });
    });
});
