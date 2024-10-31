import { Address } from '@solana/addresses';
import { AccountNotificationsApi, SolanaRpcSubscriptionsApi } from '@solana/rpc-subscriptions-api';
import { createSubscriptionRpc, RpcSubscriptions } from '@solana/rpc-subscriptions-spec';

import {
    createDefaultRpcSubscriptionsTransport,
    createDefaultSolanaRpcSubscriptionsChannelCreator,
    createSolanaRpcSubscriptionsApi,
} from '..';

function createLocalhostSolanaRpcSubscriptions(): RpcSubscriptions<SolanaRpcSubscriptionsApi> {
    return createSubscriptionRpc({
        api: createSolanaRpcSubscriptionsApi(),
        transport: createDefaultRpcSubscriptionsTransport({
            createChannel: createDefaultSolanaRpcSubscriptionsChannelCreator({ url: 'ws://localhost:8900' }),
        }),
    });
}

describe('accountNotifications', () => {
    let rpcSubscriptions: RpcSubscriptions<AccountNotificationsApi>;
    beforeEach(() => {
        rpcSubscriptions = createLocalhostSolanaRpcSubscriptions();
    });

    it('can subscribe to account notifications', async () => {
        expect.hasAssertions();
        const abortSignal = new AbortController().signal;
        const subscriptionPromise = rpcSubscriptions
            .accountNotifications('4nTLDQiSTRHbngKZWPMfYnZdWTbKiNeuuPcX7yFUpSAc' as Address)
            .subscribe({ abortSignal });

        await expect(subscriptionPromise).resolves.toEqual(
            expect.objectContaining({
                [Symbol.asyncIterator]: expect.any(Function),
            }),
        );
    });
});
