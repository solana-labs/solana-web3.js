import { safeRace } from '@solana/promises';

export type InterruptibleAsyncIterator<T, TReturn = unknown, TNext = undefined> = {
    next(...args: [] | [TNext]): Promise<
        IteratorResult<
            T,
            // Add in `undefined` here, to cover the interruption case.
            TReturn | undefined
        >
    >;
    return(value: PromiseLike<TReturn> | TReturn): Promise<IteratorResult<T, TReturn>>;
    return(value?: PromiseLike<TReturn> | TReturn): Promise<
        IteratorResult<
            T,
            // Add in `undefined` here, to cover the interruption case.
            TReturn | undefined
        >
    >;
};

type MakeAsyncIteratorInterruptible<TIterator extends AsyncIterator<unknown, unknown, unknown>> =
    InterruptibleAsyncIterator<
        /* T */ Extract<Awaited<ReturnType<TIterator['next']>>, { done?: false }>['value'],
        /* TReturn */ Extract<Awaited<ReturnType<TIterator['next']>>, { done: true }>['value'],
        /* TNext */ Parameters<TIterator['next']>[0]
    > &
        ('throw' extends keyof TIterator ? Pick<TIterator, 'throw'> : Record<string, never>);

function shallowClone<T extends object>(value: T): T {
    return { ...value };
}

/**
 * This interruptible iterator is designed so that any pending iteration of the inner iterator be
 * abruptly interrupted by a call to `return` on the outer iterator. All pending calls to `next`
 * will return `undefined` upon interruption, unconditionally and immediately.
 *
 * Features:
 *
 *     - Calling `return` will immediately cause pending calls to `next` or `throw` to resolve
 *     - Calling `return` will also call `return` on the inner iterator so that it can run cleanup
 *     - Calling `throw` will delegate to the inner iterator's `throw` if it is defined
 *     - This iterator will terminate if ever the inner iterator returns an `IteratorReturnResult`
 *     - This iterator will terminate if the inner iterator's `next` or `throw` method rejects
 *     - Once terminated, this iterator will no longer forward calls to the inner iterator
 *     - This iterator will return a clone of the terminal result via `next`, `return`, and `throw`
 *
 * Interruptible async iterators can be useful when the promises vended by their inner iterator
 * might pend indefinitely. Calling `return` on an interruptible iterator signals to its consumers
 * to return early while still telling the inner iterator that it's time to run cleanup.
 */
export function createInterruptibleAsyncIterator<TIterator extends AsyncIterator<unknown, unknown, unknown>>(
    innerIterator: TIterator,
): Readonly<MakeAsyncIteratorInterruptible<TIterator>> {
    let didTerminate = false;
    let terminateIterator!: <TReturn>(terminalValue?: PromiseLike<TReturn> | TReturn) => void;
    const terminalResponsePromise = new Promise<IteratorReturnResult<unknown>>(resolve => {
        terminateIterator = terminalValue => {
            if (didTerminate) {
                return;
            }
            didTerminate = true;
            resolve(
                terminalValue && typeof terminalValue === 'object' && 'then' in terminalValue
                    ? terminalValue.then(value => ({ done: true, value }))
                    : { done: true, value: terminalValue },
            );
        };
    });
    function delegate(innerIterator: TIterator, methodName: 'next' | 'throw') {
        return (...args: Parameters<NonNullable<TIterator[typeof methodName]>>) => {
            if (didTerminate) {
                return getTerminalResponsePromise();
            }
            const terminalResponsePromise = getTerminalResponsePromise();
            const innerResultPromise = innerIterator[methodName]!(...args);
            return safeRace([
                terminalResponsePromise,
                innerResultPromise.catch(handleInnerRejection),
                innerResultPromise.then(handleInnerResult),
            ]);
        };
    }
    function getTerminalResponsePromise() {
        return terminalResponsePromise.then(shallowClone);
    }
    function handleInnerRejection<T>(e?: T): never {
        terminateIterator();
        throw e;
    }
    function handleInnerResult<T, TReturn>(result: IteratorResult<T, TReturn>) {
        if (result.done) {
            terminateIterator(result.value);
        }
        return result;
    }
    return Object.freeze({
        /**
         * We purposely do not spread non-iterator properties of the inner iterator here.
         *
         * Typically when an iterator offers additional properties the intent is to either inspect
         * or affect the internal state of the iterator. An iterator that offers a `reset` method
         * is one example.
         *
         * Our interruptible iterator is not designed to handle unpredictable state transitions of
         * the inner iterator (eg. transitioning from `done: true` back to `done: false`). As such
         * we want to strip out any extra properties that might allow the kind of access to the
         * inner iterator that could cause such unpredictable state transitions.
         */
        next: delegate(innerIterator, 'next'),
        return(value) {
            if (!didTerminate) {
                if (innerIterator.return) {
                    /**
                     * Though it's important to call the inner iterator's `return` method to force
                     * it to run any cleanup code, we are not interested in its return value.
                     * Waiting for the inner iterator's return value to resolve would invite the
                     * possibility of a deadlock; the inner iterator's return value could, after
                     * all, pend indefinitely.
                     *
                     * The design of our interruptible iterator demands that any pending iteration
                     * of the inner iterator be abruptly interrupted by returning an
                     * `IteratorReturnResult`, unconditionally and immediately.
                     */
                    innerIterator.return(value);
                }
                terminateIterator(value);
            }
            return getTerminalResponsePromise();
        },
        ...(innerIterator.throw ? { throw: delegate(innerIterator, 'throw') } : null),
    } as MakeAsyncIteratorInterruptible<TIterator>);
}
