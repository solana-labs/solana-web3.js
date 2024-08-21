import { RpcWebSocketConnection } from '../websocket-connection';

const connection = null as unknown as RpcWebSocketConnection;

// [DESCRIBE] RpcWebSocketConnection
{
    // It is an `AsyncIterable`
    {
        connection satisfies AsyncIterable<unknown>;
    }

    // It produces an `AsyncIterator`
    {
        connection[Symbol.asyncIterator]() satisfies AsyncIterator<unknown>;
    }

    // Is not an `AsyncIterableIterator`
    {
        // @ts-expect-error Should not be able to produce an iterable.
        connection satisfies AsyncIterableIterator<unknown>;
        // @ts-expect-error Should not be able to produce an iterable.
        connection[Symbol.asyncIterator]() satisfies AsyncIterableIterator<unknown>;
    }
}
