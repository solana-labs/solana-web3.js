import { RpcSubscriptionsTransport } from '@solana/rpc-subscriptions-spec';

import { getWebSocketTransportWithConnectionSharding } from '../rpc-subscriptions-connection-sharding';

describe('getWebSocketTransportWithConnectionSharding', () => {
    let getShard: jest.Mock;
    let mockInnerTransport: jest.MockedFn<RpcSubscriptionsTransport>;
    let send: jest.Mock<(payload: unknown) => Promise<void>>;
    let transport: RpcSubscriptionsTransport;
    beforeEach(() => {
        jest.useFakeTimers();
        getShard = jest.fn();
        send = jest.fn().mockResolvedValue(undefined);
        send = jest.fn().mockResolvedValue(undefined);
        mockInnerTransport = jest.fn().mockResolvedValue({
            async *[Symbol.asyncIterator]() {
                yield await new Promise(() => {
                    /* never resolve */
                });
            },
            send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: send,
        });
        transport = getWebSocketTransportWithConnectionSharding({
            getShard,
            transport: mockInnerTransport,
        });
    });
    describe('given payloads that shard to the same key', () => {
        beforeEach(() => {
            getShard.mockReturnValue('shard-key');
        });
        it('sends the initial message when constructing a new connection', async () => {
            expect.assertions(1);
            await Promise.all([
                transport({ payload: 'hello', signal: new AbortController().signal }),
                transport({ payload: 'world', signal: new AbortController().signal }),
            ]);
            expect(mockInnerTransport).toHaveBeenCalledWith(
                expect.objectContaining({
                    payload: 'hello',
                }),
            );
        });
        it('sends subsequent messages over the cached connection in the same runloop', async () => {
            expect.assertions(2);
            await Promise.all([
                transport({ payload: 'hello', signal: new AbortController().signal }),
                transport({ payload: 'world', signal: new AbortController().signal }),
            ]);
            expect(mockInnerTransport).toHaveBeenCalledTimes(1);
            expect(send).toHaveBeenCalledWith('world');
        });
        it('sends subsequent messages over the cached connection in different runloops', async () => {
            expect.assertions(2);
            await transport({ payload: 'hello', signal: new AbortController().signal });
            await transport({ payload: 'world', signal: new AbortController().signal });
            expect(mockInnerTransport).toHaveBeenCalledTimes(1);
            expect(send).toHaveBeenCalledWith('world');
        });
        it('reuses the same connection for all payloads in the same runloop', async () => {
            expect.assertions(1);
            await Promise.all([
                transport({ payload: 'hello', signal: new AbortController().signal }),
                transport({ payload: 'world', signal: new AbortController().signal }),
            ]);
            expect(mockInnerTransport).toHaveBeenCalledTimes(1);
        });
        it('reuses the same connection for all payloads in different runloops', async () => {
            expect.assertions(1);
            await transport({ payload: 'hello', signal: new AbortController().signal });
            await transport({ payload: 'world', signal: new AbortController().signal });
            expect(mockInnerTransport).toHaveBeenCalledTimes(1);
        });
    });
    describe('given payloads that shard to different keys', () => {
        beforeEach(() => {
            let shardKey = 0;
            getShard.mockImplementation(() => `${++shardKey}`);
        });
        it('creates a connection for each payload in the same runloop', async () => {
            expect.assertions(1);
            await Promise.all([
                transport({ payload: 'hello', signal: new AbortController().signal }),
                transport({ payload: 'world', signal: new AbortController().signal }),
            ]);
            expect(mockInnerTransport).toHaveBeenCalledTimes(2);
        });
        it('creates a connection for each payload in different runloops', async () => {
            expect.assertions(1);
            await transport({ payload: 'hello', signal: new AbortController().signal });
            await transport({ payload: 'world', signal: new AbortController().signal });
            expect(mockInnerTransport).toHaveBeenCalledTimes(2);
        });
    });
});
