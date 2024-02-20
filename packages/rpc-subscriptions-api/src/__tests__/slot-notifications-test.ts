import { type RpcSubscriptions } from '@solana/rpc-subscriptions-spec';
import fetchMock from 'jest-fetch-mock-fork';

import type { SlotNotificationsApi } from '../slot-notifications';
import { createLocalhostSolanaRpcSubscriptions } from './__setup__';

describe('slotNotifications', () => {
    let rpc: RpcSubscriptions<SlotNotificationsApi>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createLocalhostSolanaRpcSubscriptions();
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
