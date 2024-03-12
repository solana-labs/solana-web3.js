import { SOLANA_ERROR__JSON_RPC__SERVER_ERROR_NODE_UNHEALTHY, SolanaError } from '@solana/errors';
import { createRpc, type Rpc } from '@solana/rpc-spec';

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
        const errorCode = SOLANA_ERROR__JSON_RPC__SERVER_ERROR_NODE_UNHEALTHY;
        const errorObject = {
            code: errorCode,
            data: { numSlotsBehind: 123 },
            message: errorMessage,
        };
        beforeEach(() => {
            rpc = createRpc({
                api: createSolanaRpcApi(),
                transport: jest.fn().mockResolvedValue({ error: errorObject }),
            });
        });
        it('returns an error message', async () => {
            expect.assertions(1);
            const healthPromise = rpc.getHealth().send();
            await expect(healthPromise).rejects.toThrow(
                new SolanaError(SOLANA_ERROR__JSON_RPC__SERVER_ERROR_NODE_UNHEALTHY, {
                    numSlotsBehind: 123,
                }),
            );
        });
    });
});
