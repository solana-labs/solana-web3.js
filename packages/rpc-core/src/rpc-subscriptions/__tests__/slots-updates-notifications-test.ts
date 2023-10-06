import { createJsonSubscriptionRpc, createWebSocketTransport } from '@solana/rpc-transport';
import type { RpcSubscriptions } from '@solana/rpc-transport/dist/types/json-rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import {
    createSolanaRpcSubscriptionsApi_UNSTABLE,
    SolanaRpcSubscriptions,
    SolanaRpcSubscriptionsUnstable,
} from '../index';

describe('slotsUpdatesNotifications', () => {
    let rpc: RpcSubscriptions<SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonSubscriptionRpc<SolanaRpcSubscriptions & SolanaRpcSubscriptionsUnstable>({
            api: createSolanaRpcSubscriptionsApi_UNSTABLE(),
            transport: createWebSocketTransport({
                sendBufferHighWatermark: Number.POSITIVE_INFINITY,
                url: 'ws://127.0.0.1:8900',
            }),
        });
    });

    it('produces slots updates notifications', async () => {
        expect.assertions(1);
        const slotsUpdatesNotifications = await rpc
            .slotsUpdatesNotifications()
            .subscribe({ abortSignal: new AbortController().signal });
        const iterator = slotsUpdatesNotifications[Symbol.asyncIterator]();
        await expect(iterator.next()).resolves.toHaveProperty(
            'value',
            expect.objectContaining({
                slot: expect.any(BigInt),
                timestamp: expect.any(BigInt),
                type: expect.any(String),
            })
        );
    });
});
