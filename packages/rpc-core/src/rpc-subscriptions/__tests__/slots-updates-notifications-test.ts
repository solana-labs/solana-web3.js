import { createJsonSubscriptionRpc, createWebSocketTransport } from '@solana/rpc-transport';
import type { RpcSubscriptions } from '@solana/rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createSolanaRpcSubscriptionsApi_UNSTABLE, SlotsUpdatesNotificationsApi } from '../index';

describe('slotsUpdatesNotifications', () => {
    let rpc: RpcSubscriptions<SlotsUpdatesNotificationsApi>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonSubscriptionRpc<SlotsUpdatesNotificationsApi>({
            api: createSolanaRpcSubscriptionsApi_UNSTABLE(),
            transport: createWebSocketTransport({
                sendBufferHighWatermark: Number.POSITIVE_INFINITY,
                url: 'ws://127.0.0.1:8900',
            }),
        });
    });

    it('produces slots updates notifications', async () => {
        expect.assertions(1);
        const abortController = new AbortController();
        try {
            const slotsUpdatesNotifications = await rpc
                .slotsUpdatesNotifications()
                .subscribe({ abortSignal: abortController.signal });
            const iterator = slotsUpdatesNotifications[Symbol.asyncIterator]();
            await expect(iterator.next()).resolves.toHaveProperty(
                'value',
                expect.objectContaining({
                    slot: expect.any(BigInt),
                    timestamp: expect.any(BigInt),
                    type: expect.any(String),
                }),
            );
        } finally {
            abortController.abort();
        }
    });
});
