import { SolanaRpcSubscriptionsApi, SolanaRpcSubscriptionsApiUnstable } from '..';

'accountNotifications' satisfies keyof SolanaRpcSubscriptionsApi;
// @ts-expect-error RPC subscriptions API does not have this method
'someMadeUpNotifications' satisfies keyof SolanaRpcSubscriptionsApi;

// if we extend the RPC API with additional methods, we can access them on keyof
type testRpcSubscriptionsApi = SolanaRpcSubscriptionsApi & {
    someMadeUpNotifications: () => void;
};
'someMadeUpNotifications' satisfies keyof testRpcSubscriptionsApi;

// slots updates notifications are available on unstable API only
'slotsUpdatesNotifications' satisfies keyof SolanaRpcSubscriptionsApiUnstable;
// @ts-expect-error RPC subscriptions API does not have this method
'slotsUpdatesNotifications' satisfies keyof SolanaRpcSubscriptionsApi;

// vote notifications are available on unstable API only
'voteNotifications' satisfies keyof SolanaRpcSubscriptionsApiUnstable;
// @ts-expect-error RPC subscriptions API does not have this method
'voteNotifications' satisfies keyof SolanaRpcSubscriptionsApi;
