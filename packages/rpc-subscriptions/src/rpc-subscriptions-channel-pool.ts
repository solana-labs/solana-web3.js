import { RpcSubscriptionsChannelCreator } from '@solana/rpc-subscriptions-spec';

import { ChannelPoolEntry, createChannelPool } from './rpc-subscriptions-channel-pool-internal';

type Config = Readonly<{
    maxSubscriptionsPerChannel: number;
    minChannels: number;
}>;

export function getChannelPoolingChannelCreator<
    TChannelCreator extends RpcSubscriptionsChannelCreator<unknown, unknown>,
>(createChannel: TChannelCreator, { maxSubscriptionsPerChannel, minChannels }: Config): TChannelCreator {
    const pool = createChannelPool();
    /**
     * This function advances the free channel index to the pool entry with the most capacity. It
     * sets the index to `-1` if all channels are full.
     */
    function recomputeFreeChannelIndex() {
        if (pool.entries.length < minChannels) {
            // Don't set the free channel index until the pool fills up; we want to keep creating
            // channels before we start rotating among them.
            pool.freeChannelIndex = -1;
            return;
        }
        let mostFreeChannel: Readonly<{ poolIndex: number; subscriptionCount: number }> | undefined;
        for (let ii = 0; ii < pool.entries.length; ii++) {
            const nextPoolIndex = (pool.freeChannelIndex + ii + 2) % pool.entries.length;
            const nextPoolEntry =
                // Start from the item two positions after the current item. This way, the
                // search will finish on the item after the current one. This ensures that, if
                // any channels tie for having the most capacity, the one that will be chosen is
                // the one immediately to the current one's right (wrapping around).
                pool.entries[nextPoolIndex];
            if (
                nextPoolEntry.subscriptionCount < maxSubscriptionsPerChannel &&
                (!mostFreeChannel || mostFreeChannel.subscriptionCount >= nextPoolEntry.subscriptionCount)
            ) {
                mostFreeChannel = {
                    poolIndex: nextPoolIndex,
                    subscriptionCount: nextPoolEntry.subscriptionCount,
                };
            }
        }
        pool.freeChannelIndex = mostFreeChannel?.poolIndex ?? -1;
    }
    return function getExistingChannelWithMostCapacityOrCreateChannel({ abortSignal }) {
        let poolEntry: ChannelPoolEntry;
        function destroyPoolEntry() {
            const index = pool.entries.findIndex(entry => entry === poolEntry);
            pool.entries.splice(index, 1);
            poolEntry.dispose();
            recomputeFreeChannelIndex();
        }
        if (pool.freeChannelIndex === -1) {
            const abortController = new AbortController();
            const newChannelPromise = createChannel({ abortSignal: abortController.signal });
            newChannelPromise
                .then(newChannel => {
                    newChannel.on('error', destroyPoolEntry, { signal: abortController.signal });
                })
                .catch(destroyPoolEntry);
            poolEntry = {
                channel: newChannelPromise,
                dispose() {
                    abortController.abort();
                },
                subscriptionCount: 0,
            };
            pool.entries.push(poolEntry);
        } else {
            poolEntry = pool.entries[pool.freeChannelIndex];
        }
        /**
         * A note about subscription counts.
         * Because of https://github.com/solana-labs/solana/pull/18943, two subscriptions for
         * materially the same notification will be coalesced on the server. This means they will be
         * assigned the same subscription id, and will occupy one subscription slot. We can't tell,
         * from here, whether a subscription will be treated in this way or not, so we
         * unconditionally increment the subscription count every time a subscription request is
         * made. This may result in subscription channels being treated as out-of-capacity when in
         * fact they are not.
         */
        poolEntry.subscriptionCount++;
        abortSignal.addEventListener('abort', function destroyConsumer() {
            poolEntry.subscriptionCount--;
            if (poolEntry.subscriptionCount === 0) {
                destroyPoolEntry();
            } else if (pool.freeChannelIndex !== -1) {
                // Back the free channel index up one position, and recompute it.
                pool.freeChannelIndex--;
                recomputeFreeChannelIndex();
            }
        });
        recomputeFreeChannelIndex();
        return poolEntry.channel;
    } as TChannelCreator;
}
