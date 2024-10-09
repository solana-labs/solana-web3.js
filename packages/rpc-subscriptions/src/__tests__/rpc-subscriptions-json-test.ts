import { RpcSubscriptionsChannel } from '@solana/rpc-subscriptions-spec';

import { getRpcSubscriptionsChannelWithJSONSerialization } from '../rpc-subscriptions-json';

describe('getRpcSubscriptionsChannelWithJSONSerialization', () => {
    let mockOn: jest.Mock;
    let channel: RpcSubscriptionsChannel<string, string>;
    function receiveMessage(message: unknown) {
        mockOn.mock.calls.filter(([type]) => type === 'message').forEach(([_, listener]) => listener(message));
    }
    beforeEach(() => {
        mockOn = jest.fn();
        channel = {
            on: mockOn,
            send: jest.fn().mockResolvedValue(void 0),
        };
    });
    it('forwards JSON-serialized messages to the underlying channel', () => {
        const channelWithJSONSerialization = getRpcSubscriptionsChannelWithJSONSerialization(channel);
        channelWithJSONSerialization.send('hello').catch(() => {});
        expect(channel.send).toHaveBeenCalledWith(JSON.stringify('hello'));
    });
    it('deserializes messages received from the underlying channel as JSON', () => {
        const channelWithJSONSerialization = getRpcSubscriptionsChannelWithJSONSerialization(channel);
        const messageListener = jest.fn();
        channelWithJSONSerialization.on('message', messageListener);
        receiveMessage(JSON.stringify('hello'));
        expect(messageListener).toHaveBeenCalledWith('hello');
    });
});
