import { pipe } from '@solana/functional';
import {
    RpcSubscriptionsChannel,
    transformChannelInboundMessages,
    transformChannelOutboundMessages,
} from '@solana/rpc-subscriptions-spec';

export function getRpcSubscriptionsChannelWithJSONSerialization(
    channel: RpcSubscriptionsChannel<string, string>,
): RpcSubscriptionsChannel<unknown, unknown> {
    return pipe(
        channel,
        c => transformChannelInboundMessages(c, JSON.parse),
        c => transformChannelOutboundMessages(c, JSON.stringify),
    );
}
