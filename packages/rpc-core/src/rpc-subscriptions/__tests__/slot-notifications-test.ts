import { createJsonSubscriptionRpc, createWebSocketTransport } from '@solana/rpc-transport';
import type { RpcSubscriptions } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createSolanaRpcSubscriptionsApi, SolanaRpcSubscriptions } from '../index';

describe('slotNotifications', () => {
    let rpc: RpcSubscriptions<SolanaRpcSubscriptions>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonSubscriptionRpc<SolanaRpcSubscriptions>({
            api: createSolanaRpcSubscriptionsApi(),
            transport: createWebSocketTransport({
                sendBufferHighWatermark: Number.POSITIVE_INFINITY,
                url: 'ws://127.0.0.1:8900',
            }),
        });
    });

    it('produces slot notifications', async () => {
        expect.assertions(1);
        const slotNotifications = await rpc
            .slotNotifications()
            .subscribe({ abortSignal: new AbortController().signal });
        const iterator = slotNotifications[Symbol.asyncIterator]();
        await expect(iterator.next()).resolves.toHaveProperty('value', {
            parent: expect.any(BigInt),
            root: expect.any(BigInt),
            slot: expect.any(BigInt),
        });
    });
});
