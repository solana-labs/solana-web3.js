import { IRpcWebSocketTransport } from '@solana/rpc-transport/dist/types/transports/transport-types';

import { getWebSocketTransportWithConnectionSharding } from '../rpc-websocket-connection-sharding';

describe('getWebSocketTransportWithConnectionSharding', () => {
    let getShard: jest.Mock;
    let iterable: jest.Mock<AsyncGenerator<unknown, void>>;
    let mockInnerTransport: jest.MockedFn<IRpcWebSocketTransport>;
    let send: jest.Mock<(payload: unknown) => Promise<void>>;
    let transport: IRpcWebSocketTransport;
    beforeEach(() => {
        jest.useFakeTimers();
        getShard = jest.fn();
        send = jest.fn().mockResolvedValue(undefined);
        iterable = jest.fn().mockImplementation(async function* () {
            yield await new Promise(() => {
                /* never resolve */
            });
        });
        send = jest.fn().mockResolvedValue(undefined);
        mockInnerTransport = jest.fn().mockResolvedValue({
            [Symbol.asyncIterator]: iterable,
            send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: send,
        });
        transport = getWebSocketTransportWithConnectionSharding({
            getShard,
            transport: mockInnerTransport,
        });
    });
    it('reuses the same connection for multiple messages sent in the same runloop', async () => {
        expect.assertions(1);
        await Promise.all([
            transport({ payload: 'hello', signal: new AbortController().signal }),
            transport({ payload: 'world', signal: new AbortController().signal }),
        ]);
        expect(mockInnerTransport).toHaveBeenCalledTimes(1);
    });
    it('reuses the same connection for multiple messages sent in different runloops', async () => {
        expect.assertions(1);
        await transport({ payload: 'hello', signal: new AbortController().signal });
        await transport({ payload: 'world', signal: new AbortController().signal });
        expect(mockInnerTransport).toHaveBeenCalledTimes(1);
    });
    it('reuses the same connection so long as there is at least one non-aborted subscription', async () => {
        expect.assertions(1);
        const abortControllerA = new AbortController();
        await transport({ payload: 'A', signal: abortControllerA.signal });
        await transport({ payload: 'B', signal: new AbortController().signal });
        abortControllerA.abort();
        await jest.runAllTimersAsync();
        await transport({ payload: 'C', signal: new AbortController().signal });
        expect(mockInnerTransport).toHaveBeenCalledTimes(1);
    });
    it('reuses the same connection even if a single subscription was aborted as many times as there are subscriptions', async () => {
        expect.assertions(1);
        const abortControllerA = new AbortController();
        await transport({ payload: 'A', signal: abortControllerA.signal });
        await transport({ payload: 'B', signal: new AbortController().signal });
        abortControllerA.abort();
        abortControllerA.abort();
        await jest.runAllTimersAsync();
        await transport({ payload: 'C', signal: new AbortController().signal });
        expect(mockInnerTransport).toHaveBeenCalledTimes(1);
    });
    it('reuses the same connection so long as there is at least one non-aborted subscription at the end of the runloop, even if all of the existing ones are aborted', async () => {
        expect.assertions(1);
        const abortControllerA = new AbortController();
        const abortControllerB = new AbortController();
        await transport({ payload: 'A', signal: abortControllerA.signal });
        await transport({ payload: 'B', signal: abortControllerB.signal });
        abortControllerA.abort();
        abortControllerB.abort();
        await transport({ payload: 'C', signal: new AbortController().signal });
        await jest.runAllTimersAsync();
        expect(mockInnerTransport).toHaveBeenCalledTimes(1);
    });
    it('creates a new connection when all of the prior subscriptions have been aborted', async () => {
        expect.assertions(1);
        const abortControllerA = new AbortController();
        const abortControllerB = new AbortController();
        await transport({ payload: 'A', signal: abortControllerA.signal });
        await transport({ payload: 'B', signal: abortControllerB.signal });
        abortControllerA.abort();
        abortControllerB.abort();
        // FIXME: Prefer async version of this timer runner. See https://github.com/jestjs/jest/issues/14549
        jest.runAllTimers();
        await transport({ payload: 'C', signal: new AbortController().signal });
        expect(mockInnerTransport).toHaveBeenCalledTimes(2);
    });
    it('creates a new connection for a message given that the prior one failed synchronously', async () => {
        expect.assertions(2);
        // First time fails synchronously.
        mockInnerTransport.mockImplementationOnce(() => {
            throw new Error('o no');
        });
        try {
            await transport({ payload: 'hello', signal: new AbortController().signal });
        } catch {
            /* empty */
        }
        expect(mockInnerTransport).toHaveBeenCalledTimes(1);
        // Second time succeeds.
        await transport({ payload: 'hello', signal: new AbortController().signal });
        expect(mockInnerTransport).toHaveBeenCalledTimes(2);
    });
    it('creates a new connection for a message given that the prior one failed asynchronously', async () => {
        expect.assertions(2);
        // First time fails asynchronously.
        mockInnerTransport.mockRejectedValueOnce(new Error('o no'));
        try {
            await transport({ payload: 'hello', signal: new AbortController().signal });
        } catch {
            /* empty */
        }
        expect(mockInnerTransport).toHaveBeenCalledTimes(1);
        // Second time succeeds.
        await transport({ payload: 'hello', signal: new AbortController().signal });
        expect(mockInnerTransport).toHaveBeenCalledTimes(2);
    });
    it('creates a new connection for a message given that the prior connection threw', async () => {
        expect.assertions(2);
        let killConnection;
        iterable.mockImplementationOnce(async function* () {
            yield await new Promise((_, reject) => {
                killConnection = reject;
            });
        });
        await transport({ payload: 'hello', signal: new AbortController().signal });
        expect(mockInnerTransport).toHaveBeenCalledTimes(1);
        // FIXME: https://github.com/microsoft/TypeScript/issues/11498
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        killConnection();
        await jest.runAllTimersAsync();
        await transport({ payload: 'hello', signal: new AbortController().signal });
        expect(mockInnerTransport).toHaveBeenCalledTimes(2);
    });
    it('creates a new connection for a message given that prior connection returned', async () => {
        expect.assertions(1);
        let returnFromConnection;
        iterable.mockImplementationOnce(async function* () {
            try {
                yield await new Promise((_, reject) => {
                    returnFromConnection = reject;
                });
            } catch {
                return;
            }
        });
        await transport({ payload: 'hello', signal: new AbortController().signal });
        // FIXME: https://github.com/microsoft/TypeScript/issues/11498
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        returnFromConnection();
        await jest.runAllTimersAsync();
        await transport({ payload: 'hello', signal: new AbortController().signal });
        expect(mockInnerTransport).toHaveBeenCalledTimes(2);
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
            })
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
    describe('given payloads that shard to the same key', () => {
        beforeEach(() => {
            getShard.mockReturnValue('shard-key');
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
