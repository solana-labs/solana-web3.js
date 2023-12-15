import { createJsonSubscriptionRpc, createWebSocketTransport, type RpcSubscriptions } from '@solana/rpc-transport';
import fetchMock from 'jest-fetch-mock-fork';

import { createSolanaRpcSubscriptionsApi, SlotNotificationsApi } from '../index';

describe('slotNotifications', () => {
    let rpc: RpcSubscriptions<SlotNotificationsApi>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonSubscriptionRpc<SlotNotificationsApi>({
            api: createSolanaRpcSubscriptionsApi(),
            transport: createWebSocketTransport({
                sendBufferHighWatermark: Number.POSITIVE_INFINITY,
                url: 'ws://127.0.0.1:8900',
            }),
        });
    });

    it('produces slot notifications', async () => {
        expect.assertions(1);
        const abortController = new AbortController();
        try {
            const slotNotifications = await rpc.slotNotifications().subscribe({ abortSignal: abortController.signal });
            const iterator = slotNotifications[Symbol.asyncIterator]();
            await expect(iterator.next()).resolves.toHaveProperty('value', {
                parent: expect.any(BigInt),
                root: expect.any(BigInt),
                slot: expect.any(BigInt),
            });
        } finally {
            abortController.abort();
        }
    });
});
