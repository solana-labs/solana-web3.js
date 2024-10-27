import '@solana/test-matchers/toBeFrozenObject';

import {
    RpcSubscriptionsChannel,
    transformChannelInboundMessages,
    transformChannelOutboundMessages,
} from '../rpc-subscriptions-channel';

type Irrelevant = { readonly brand: unique symbol };

function createMockChannel<TOutboundMessage, TInboundMessage>(): RpcSubscriptionsChannel<
    TOutboundMessage,
    TInboundMessage
> {
    return {
        on: jest.fn().mockReturnValue(() => {}),
        send: jest.fn().mockResolvedValue(void 0),
    };
}

function getMockReceive<TOutboundMessage, TInboundMessage>(
    mockChannel: RpcSubscriptionsChannel<TOutboundMessage, TInboundMessage>,
) {
    return (type: 'error' | 'message', value: unknown) => {
        (mockChannel.on as jest.Mock).mock.calls
            .filter(([t]) => t === type)
            .forEach(([_, subscriber]) => subscriber(value));
    };
}

describe('transformChannelInboundMessages', () => {
    it('transforms the incoming messages of a channel', () => {
        // Given a mock channel receiving strings.
        const mockChannel = createMockChannel<Irrelevant, string>();
        const mockReceive = getMockReceive(mockChannel);

        // When we transform incoming string messages to their length.
        const channel = transformChannelInboundMessages(mockChannel, (message: string) => message.length);
        channel satisfies RpcSubscriptionsChannel<Irrelevant, number>;

        // Then the transformed channel should receive the length of the incoming messages.
        const listener = jest.fn();
        channel.on('message', listener);
        mockReceive('message', 'Hello World!');
        expect(listener).toHaveBeenCalledWith(12);
    });

    it('can be used to parse JSON messages', () => {
        // Given a mock channel receiving JSON strings.
        const mockChannel = createMockChannel<Irrelevant, string>();
        const mockReceive = getMockReceive(mockChannel);

        // When we transform incoming JSON strings to their parsed values.
        const channel = transformChannelInboundMessages(mockChannel, JSON.parse);
        channel satisfies RpcSubscriptionsChannel<Irrelevant, unknown>;

        // Then the transformed channel should receive JSON parsed values of incoming messages.
        const listener = jest.fn();
        channel.on('message', listener);
        mockReceive('message', '{"hello": "world"}');
        expect(listener).toHaveBeenCalledWith({ hello: 'world' });
    });

    it('does not affect error messages', () => {
        // Given a mock channel receiving strings.
        const mockChannel = createMockChannel<Irrelevant, string>();
        const mockReceive = getMockReceive(mockChannel);

        // When we transform incoming string messages to their length.
        const channel = transformChannelInboundMessages(mockChannel, (message: string) => message.length);
        channel satisfies RpcSubscriptionsChannel<Irrelevant, number>;

        // Then error messages are not affected by the transformation.
        const listener = jest.fn();
        channel.on('error', listener);
        mockReceive('error', 'Hello Errors!');
        expect(listener).toHaveBeenCalledWith('Hello Errors!');
    });

    it('returns a frozen channel', () => {
        // Given a mock channel receiving strings.
        const mockChannel = createMockChannel<Irrelevant, string>();

        // When we transform incoming string messages to their length.
        const channel = transformChannelInboundMessages(mockChannel, (message: string) => message.length);

        // Then we expect the transformed channel to be a frozen object.
        expect(channel).toBeFrozenObject();
    });
});

describe('transformChannelOutboundMessages', () => {
    it('transforms the outgoing messages of a channel', async () => {
        expect.assertions(1);

        // Given a mock channel receiving numbers.
        const mockChannel = createMockChannel<number, Irrelevant>();

        // When we transform outgoing string messages to their length.
        const channel = transformChannelOutboundMessages(mockChannel, (message: string) => message.length);
        channel satisfies RpcSubscriptionsChannel<string, Irrelevant>;

        // Then the transformed channel should send the length of the outgoing messages.
        await channel.send('Hello World!');
        expect(mockChannel.send).toHaveBeenCalledWith(12);
    });

    it('can be used to stringify JSON messages', async () => {
        expect.assertions(1);

        // Given a mock channel sending JSON strings.
        const mockChannel = createMockChannel<string, Irrelevant>();

        // When we transform outgoing JSON messages to their stringified values.
        const channel = transformChannelOutboundMessages(mockChannel, JSON.stringify);
        channel satisfies RpcSubscriptionsChannel<unknown, Irrelevant>;

        // Then the transformed channel should send JSON stringified values of outgoing messages.
        await channel.send({ hello: 'world' });
        expect(mockChannel.send).toHaveBeenCalledWith('{"hello":"world"}');
    });

    it('returns a frozen channel', () => {
        // Given a mock channel.
        const mockChannel = createMockChannel<number, Irrelevant>();

        // When we get a new channel that transforms outgoing messages.
        const channel = transformChannelOutboundMessages(mockChannel, (message: string) => message.length);

        // Then we expect the transformed channel to be a frozen object.
        expect(channel).toBeFrozenObject();
    });
});
