import { type RpcSubscriptions } from '@solana/rpc-subscriptions-spec';
import fetchMock from 'jest-fetch-mock-fork';

import type { SlotsUpdatesNotificationsApi } from '../slots-updates-notifications';
import { createLocalhostSolanaRpcSubscriptions } from './__setup__';

describe('slotsUpdatesNotifications', () => {
    let rpc: RpcSubscriptions<SlotsUpdatesNotificationsApi>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createLocalhostSolanaRpcSubscriptions();
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
