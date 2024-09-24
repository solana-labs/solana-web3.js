import {
    SOLANA_ERROR__INVARIANT_VIOLATION__SUBSCRIPTION_ITERATOR_MUST_NOT_POLL_BEFORE_RESOLVING_EXISTING_MESSAGE_PROMISE,
    SOLANA_ERROR__INVARIANT_VIOLATION__SUBSCRIPTION_ITERATOR_STATE_MISSING,
    SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_CONNECTION_CLOSED,
    SolanaError,
} from '@solana/errors';

import { DataPublisher } from './data-publisher';

type Config = Readonly<{
    abortSignal: AbortSignal;
    dataChannelName: string;
    // FIXME: It would be nice to be able to constrain the type of `dataPublisher` to one that
    //        definitely supports the `dataChannelName` and `errorChannelName` channels, and
    //        furthermore publishes `TData` on the `dataChannelName` channel. This is more difficult
    //        than it should be: https://tsplay.dev/NlZelW
    dataPublisher: DataPublisher;
    errorChannelName: string;
}>;

type IteratorKey = symbol;
type IteratorState<TData> =
    | {
          __hasPolled: false;
          queuedData: TData[];
      }
    | {
          __hasPolled: true;
          onData: (data: TData) => void;
          onError: Parameters<ConstructorParameters<typeof Promise>[0]>[1];
      };

let EXPLICIT_ABORT_TOKEN: symbol;
function createExplicitAbortToken() {
    // This function is an annoying workaround to prevent `process.env.NODE_ENV` from appearing at
    // the top level of this module and thwarting an optimizing compiler's attempt to tree-shake.
    return Symbol(
        __DEV__
            ? "This symbol is thrown from a socket's iterator when the connection is explicitly " +
                  'aborted by the user'
            : undefined,
    );
}

export function createAsyncIterableFromDataPublisher<TData>({
    abortSignal,
    dataChannelName,
    dataPublisher,
    errorChannelName,
}: Config): AsyncIterable<TData> {
    const iteratorState: Map<IteratorKey, IteratorState<TData>> = new Map();
    function errorAndClearAllIteratorStates(reason: unknown) {
        const errorCallbacks = [...iteratorState.values()]
            .filter((state): state is Extract<IteratorState<TData>, { __hasPolled: true }> => state.__hasPolled)
            .map(({ onError }) => onError);
        iteratorState.clear();
        errorCallbacks.forEach(cb => {
            try {
                cb(reason);
            } catch {
                /* empty */
            }
        });
    }
    const abortController = new AbortController();
    abortSignal.addEventListener('abort', () => {
        abortController.abort();
        errorAndClearAllIteratorStates((EXPLICIT_ABORT_TOKEN ||= createExplicitAbortToken()));
    });
    const options = { signal: abortController.signal } as const;
    dataPublisher.on(
        errorChannelName,
        err => {
            abortController.abort();
            errorAndClearAllIteratorStates(err);
        },
        options,
    );
    dataPublisher.on(
        dataChannelName,
        data => {
            iteratorState.forEach((state, iteratorKey) => {
                if (state.__hasPolled) {
                    const { onData } = state;
                    iteratorState.set(iteratorKey, { __hasPolled: false, queuedData: [] });
                    onData(data as TData);
                } else {
                    state.queuedData.push(data as TData);
                }
            });
        },
        options,
    );
    return {
        async *[Symbol.asyncIterator]() {
            if (abortSignal.aborted) {
                return;
            }
            const iteratorKey = Symbol();
            iteratorState.set(iteratorKey, { __hasPolled: false, queuedData: [] });
            try {
                while (true) {
                    const state = iteratorState.get(iteratorKey);
                    if (!state) {
                        // There should always be state by now.
                        throw new SolanaError(SOLANA_ERROR__INVARIANT_VIOLATION__SUBSCRIPTION_ITERATOR_STATE_MISSING);
                    }
                    if (state.__hasPolled) {
                        // You should never be able to poll twice in a row.
                        throw new SolanaError(
                            SOLANA_ERROR__INVARIANT_VIOLATION__SUBSCRIPTION_ITERATOR_MUST_NOT_POLL_BEFORE_RESOLVING_EXISTING_MESSAGE_PROMISE,
                        );
                    }
                    const queuedData = state.queuedData;
                    if (queuedData.length) {
                        state.queuedData = [];
                        yield* queuedData;
                    } else {
                        try {
                            yield await new Promise<TData>((resolve, reject) => {
                                iteratorState.set(iteratorKey, {
                                    __hasPolled: true,
                                    onData: resolve,
                                    onError: reject,
                                });
                            });
                        } catch (e) {
                            if (e === (EXPLICIT_ABORT_TOKEN ||= createExplicitAbortToken())) {
                                return;
                            } else {
                                throw new SolanaError(SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_CONNECTION_CLOSED, {
                                    cause: e,
                                });
                            }
                        }
                    }
                }
            } finally {
                iteratorState.delete(iteratorKey);
            }
        },
    };
}
