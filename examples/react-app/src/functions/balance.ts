import { AccountNotificationsApi, Address, GetBalanceApi, Lamports, Rpc, RpcSubscriptions } from '@solana/web3.js';
import { SWRSubscription } from 'swr/subscription';

const EXPLICIT_ABORT_TOKEN = Symbol();

/**
 * This is an example of a strategy to fetch some account data and to keep it up to date over time.
 * It's implemented as an SWR subscription function (https://swr.vercel.app/docs/subscription) but
 * the approach is generalizable.
 *
 *     1. Fetch the current account state and publish it to the consumer
 *     2. Subscribe to account data notifications and publish them to the consumer
 *
 * At all points in time, check that the update you received -- no matter from where -- is from a
 * higher slot (ie. is newer) than the last one you published to the consumer.
 */
export function balanceSubscribe(
    rpc: Rpc<GetBalanceApi>,
    rpcSubscriptions: RpcSubscriptions<AccountNotificationsApi>,
    ...subscriptionArgs: Parameters<SWRSubscription<{ address: Address }, Lamports>>
) {
    const [{ address }, { next }] = subscriptionArgs;
    const abortController = new AbortController();
    // Keep track of the slot of the last-published update.
    let lastUpdateSlot = -1n;
    // Fetch the current balance of this account.
    rpc.getBalance(address, { commitment: 'confirmed' })
        .send({ abortSignal: abortController.signal })
        .then(({ context: { slot }, value: lamports }) => {
            if (slot < lastUpdateSlot) {
                // The last-published update (ie. from the subscription) is newer than this one.
                return;
            }
            lastUpdateSlot = slot;
            next(null /* err */, lamports /* data */);
        })
        .catch(e => {
            if (e !== EXPLICIT_ABORT_TOKEN) {
                next(e /* err */);
            }
        });
    // Subscribe for updates to that balance.
    rpcSubscriptions
        .accountNotifications(address)
        .subscribe({ abortSignal: abortController.signal })
        .then(async accountInfoNotifications => {
            try {
                for await (const {
                    context: { slot },
                    value: { lamports },
                } of accountInfoNotifications) {
                    if (slot < lastUpdateSlot) {
                        // The last-published update (ie. from the initial fetch) is newer than this
                        // one.
                        continue;
                    }
                    lastUpdateSlot = slot;
                    next(null /* err */, lamports /* data */);
                }
            } catch (e) {
                next(e /* err */);
            }
        })
        .catch(e => {
            if (e !== EXPLICIT_ABORT_TOKEN) {
                next(e /* err */);
            }
        });
    // Return a cleanup callback that aborts the RPC call/subscription.
    return () => {
        abortController.abort(EXPLICIT_ABORT_TOKEN);
    };
}
