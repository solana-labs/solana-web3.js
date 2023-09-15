import { IRpcSubscriptionsApi } from '@solana/rpc-transport/dist/types/json-rpc-types';

import { createSolanaRpcSubscriptionsApi } from '../index';

interface TestRpcSubscriptionNotifications {
    thingNotifications(...args: unknown[]): unknown;
}

describe('IRpcSubscriptionsApi', () => {
    let api: IRpcSubscriptionsApi<TestRpcSubscriptionNotifications>;
    beforeEach(() => {
        api = createSolanaRpcSubscriptionsApi() as unknown as IRpcSubscriptionsApi<TestRpcSubscriptionNotifications>;
    });
    it('synthesizes subscribe/unsubscribe method names from the name of the notification', () => {
        expect(api.thingNotifications()).toMatchObject({
            subscribeMethodName: 'thingSubscribe',
            unsubscribeMethodName: 'thingUnsubscribe',
        });
    });
});
