import { pipe } from '@solana/functional';
import { parseJsonWithBigInts, stringifyJsonWithBigints } from '@solana/rpc-spec-types';
import {
    RpcSubscriptionsChannel,
    transformChannelInboundMessages,
    transformChannelOutboundMessages,
} from '@solana/rpc-subscriptions-spec';

export function getRpcSubscriptionsChannelWithBigIntJSONSerialization(
    channel: RpcSubscriptionsChannel<string, string>,
): RpcSubscriptionsChannel<unknown, unknown> {
    return pipe(
        channel,
        c => transformChannelInboundMessages(c, parseJsonWithBigInts),
        c => transformChannelOutboundMessages(c, stringifyJsonWithBigints),
    );
}
