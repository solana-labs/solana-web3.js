import { SOLANA_ERROR__RPC_SUBSCRIPTIONS__CANNOT_CREATE_SUBSCRIPTION_PLAN, SolanaError } from '@solana/errors';

import { createSubscriptionRpc } from '../rpc-subscriptions';

interface TestRpcSubscriptionNotifications {
    thingNotifications(...args: unknown[]): unknown;
}

describe('createSubscriptionRpc', () => {
    it('throws when the API produces no subscription plan', () => {
        const rpcSubscriptions = createSubscriptionRpc<TestRpcSubscriptionNotifications>({
            // @ts-expect-error Does not implement API on purpose
            api: {},
            transport: jest.fn(),
        });
        expect(() => {
            rpcSubscriptions.thingNotifications();
        }).toThrow(
            new SolanaError(SOLANA_ERROR__RPC_SUBSCRIPTIONS__CANNOT_CREATE_SUBSCRIPTION_PLAN, {
                notificationName: 'thingNotifications',
            }),
        );
    });
});
