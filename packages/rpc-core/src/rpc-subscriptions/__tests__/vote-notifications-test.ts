import { createJsonSubscriptionRpc, createWebSocketTransport } from '@solana/rpc-transport';
import type { RpcSubscriptions } from '@solana/rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createSolanaRpcSubscriptionsApi_UNSTABLE, VoteNotificationsApi } from '../index';

describe('voteNotifications', () => {
    let rpc: RpcSubscriptions<VoteNotificationsApi>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonSubscriptionRpc<VoteNotificationsApi>({
            api: createSolanaRpcSubscriptionsApi_UNSTABLE(),
            transport: createWebSocketTransport({
                sendBufferHighWatermark: Number.POSITIVE_INFINITY,
                url: 'ws://127.0.0.1:8900',
            }),
        });
    });

    it('produces vote notifications', async () => {
        expect.assertions(1);
        const abortController = new AbortController();
        try {
            const voteNotifications = await rpc.voteNotifications().subscribe({ abortSignal: abortController.signal });
            const iterator = voteNotifications[Symbol.asyncIterator]();
            await expect(iterator.next()).resolves.toHaveProperty(
                'value',
                expect.objectContaining({
                    hash: expect.any(String),
                    signature: expect.any(String),
                    slots: expect.arrayContaining([expect.any(BigInt)]),
                    // TODO: Test for null. It appears this is maybe non-deterministic? Seems to maybe occur on delayed votes?
                    timestamp: expect.any(BigInt),
                    votePubkey: expect.any(String),
                }),
            );
        } finally {
            abortController.abort();
        }
    });
});
