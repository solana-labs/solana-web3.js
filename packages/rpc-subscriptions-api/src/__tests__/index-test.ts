import type { RpcSubscriptionsApi, RpcSubscriptionsApiMethods } from '@solana/rpc-subscriptions-spec';

import { createSolanaRpcSubscriptionsApi } from '..';

interface TestRpcSubscriptionNotifications extends RpcSubscriptionsApiMethods {
    thingNotifications(...args: unknown[]): unknown;
}

describe('RpcSubscriptionsApi', () => {
    let api: RpcSubscriptionsApi<TestRpcSubscriptionNotifications>;
    beforeEach(() => {
        api = createSolanaRpcSubscriptionsApi();
    });
    it('synthesizes subscribe/unsubscribe method names from the name of the notification', () => {
        expect(api.thingNotifications()).toMatchObject({
            subscribeMethodName: 'thingSubscribe',
            unsubscribeMethodName: 'thingUnsubscribe',
        });
    });
});
