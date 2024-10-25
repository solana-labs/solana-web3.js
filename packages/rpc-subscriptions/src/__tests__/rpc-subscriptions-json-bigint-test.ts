import { RpcSubscriptionsChannel } from '@solana/rpc-subscriptions-spec';

import { getRpcSubscriptionsChannelWithBigIntJSONSerialization } from '../rpc-subscriptions-json-bigint';

const MAX_SAFE_INTEGER_PLUS_ONE = BigInt(Number.MAX_SAFE_INTEGER) + 1n;

describe('getRpcSubscriptionsChannelWithBigIntJSONSerialization', () => {
    let mockOn: jest.Mock;
    let mockChannel: RpcSubscriptionsChannel<string, string>;
    function receiveMessage(message: unknown) {
        mockOn.mock.calls.filter(([type]) => type === 'message').forEach(([_, listener]) => listener(message));
    }
    beforeEach(() => {
        mockOn = jest.fn();
        mockChannel = {
            on: mockOn,
            send: jest.fn().mockResolvedValue(void 0),
        };
    });
    it('forwards JSON-serialized large integers to the underlying channel', () => {
        const channel = getRpcSubscriptionsChannelWithBigIntJSONSerialization(mockChannel);
        channel.send({ value: MAX_SAFE_INTEGER_PLUS_ONE }).catch(() => {});
        expect(mockChannel.send).toHaveBeenCalledWith(`{"value":${MAX_SAFE_INTEGER_PLUS_ONE}}`);
    });
    it('deserializes large integers received from the underlying channel as JSON', () => {
        const channel = getRpcSubscriptionsChannelWithBigIntJSONSerialization(mockChannel);
        const messageListener = jest.fn();
        channel.on('message', messageListener);
        receiveMessage(`{"value":${MAX_SAFE_INTEGER_PLUS_ONE}}`);
        expect(messageListener).toHaveBeenCalledWith({ value: MAX_SAFE_INTEGER_PLUS_ONE });
    });
});
