import { RpcSubscriptionsChannel } from '@solana/rpc-subscriptions-spec';

export type ChannelPoolEntry = {
    channel: PromiseLike<RpcSubscriptionsChannel<unknown, unknown>> | RpcSubscriptionsChannel<unknown, unknown>;
    readonly dispose: () => void;
    subscriptionCount: number;
};

type ChannelPool = { readonly entries: ChannelPoolEntry[]; freeChannelIndex: number };

export function createChannelPool(): ChannelPool {
    return {
        entries: [],
        freeChannelIndex: -1,
    };
}
