import { createInterruptibleAsyncIterator } from '../interruptible';

// [DESCRIBE] createInterruptibleAsyncIterator
{
    // It returns an `AsyncIterator` with an identical type except for the return type which must include `undefined`
    {
        const originalIterator = null as unknown as AsyncIterator<string, 42, [true]>;
        createInterruptibleAsyncIterator(originalIterator) satisfies AsyncIterator<
            /* T */ string,
            // The addition of `undefined` here represents what would be returned in the
            // interruption scenario. Interruptions always return `undefined` as the final value.
            /* TReturn */ 42 | undefined,
            /* TNext */ [true]
        >;
        // @ts-expect-error `TReturn` here must include `undefined`.
        createInterruptibleAsyncIterator(originalIterator) satisfies AsyncIterator<
            /* T */ string,
            /* TReturn */ 42,
            /* TNext */ [true]
        >;
    }

    // It strips out properties from the source object that are not part of the iterator protocol.
    {
        const originalIterator = null as unknown as AsyncIterator<unknown> & { reset(): void };
        // @ts-expect-error The `reset` method should not be found on the return value.
        createInterruptibleAsyncIterator(originalIterator) satisfies { reset(): void };
    }

    // It resolves to `TReturn` when a value is supplied to `return()`
    {
        const originalIterator = null as unknown as AsyncIterator<unknown, 42>;
        const interruptibleIterator = createInterruptibleAsyncIterator(originalIterator);
        interruptibleIterator.return!(42) satisfies Promise<IteratorResult<unknown, 42>>;
        interruptibleIterator.return!(Promise.resolve(42)) satisfies Promise<IteratorResult<unknown, 42>>;
    }

    // It resolves to `TReturn | undefined` when no value is supplied to `return()`
    {
        const originalIterator = null as unknown as AsyncIterator<unknown, 42>;
        const interruptibleIterator = createInterruptibleAsyncIterator(originalIterator);
        interruptibleIterator.return!() satisfies Promise<IteratorResult<unknown, 42 | undefined>>;
    }

    // It exposes the original iterator's throw method
    {
        const originalIterator = null as unknown as Omit<AsyncIterator<string, 42>, 'throw'> & {
            throw(e?: 666): Promise<IteratorResult<string, 42>>;
        };
        createInterruptibleAsyncIterator(originalIterator).throw satisfies (typeof originalIterator)['throw'];
    }

    // It exposes no `throw()` method when the original iterator has none
    {
        const originalIterator = null as unknown as Omit<AsyncIterator<unknown>, 'throw'>;
        // @ts-expect-error No `throw` function should be found on the return value.
        createInterruptibleAsyncIterator(originalIterator) satisfies { throw: () => void };
    }
}
