import {
    SOLANA_ERROR__INVARIANT_VIOLATION__WEBSOCKET_MESSAGE_ITERATOR_MUST_NOT_POLL_BEFORE_RESOLVING_EXISTING_MESSAGE_PROMISE,
    SOLANA_ERROR__INVARIANT_VIOLATION__WEBSOCKET_MESSAGE_ITERATOR_STATE_MISSING,
    SOLANA_ERROR__RPC_SUBSCRIPTIONS__TRANSPORT_CLOSED_BEFORE_MESSAGE_BUFFERED,
    SOLANA_ERROR__RPC_SUBSCRIPTIONS__TRANSPORT_CONNECTION_CLOSED,
    SOLANA_ERROR__RPC_SUBSCRIPTIONS__TRANSPORT_FAILED_TO_CONNECT,
    SolanaError,
} from '@solana/errors';
import WebSocket from '@solana/ws-impl';

type Config = Readonly<{
    sendBufferHighWatermark: number;
    signal: AbortSignal;
    url: string;
}>;
type IteratorKey = symbol;
type IteratorState =
    | {
          __hasPolled: false;
          queuedMessages: unknown[];
      }
    | {
          __hasPolled: true;
          onError: Parameters<ConstructorParameters<typeof Promise>[0]>[1];
          onMessage: Parameters<ConstructorParameters<typeof Promise>[0]>[0];
      };
export type RpcWebSocketConnection = Readonly<{
    send(payload: unknown): Promise<void>;
    [Symbol.asyncIterator](): AsyncGenerator<unknown>;
}>;

const EXPLICIT_ABORT_TOKEN = Symbol(
    __DEV__
        ? "This symbol is thrown from a socket's iterator when the connection is explicitly aborted by the user"
        : undefined,
);

export async function createWebSocketConnection({
    sendBufferHighWatermark,
    signal,
    url,
}: Config): Promise<RpcWebSocketConnection> {
    return await new Promise((resolve, reject) => {
        signal.addEventListener('abort', handleAbort, { once: true });
        const iteratorState: Map<IteratorKey, IteratorState> = new Map();
        function errorAndClearAllIteratorStates(reason: unknown) {
            const errorCallbacks = [...iteratorState.values()]
                .filter((state): state is Extract<IteratorState, { __hasPolled: true }> => state.__hasPolled)
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
        function handleAbort() {
            errorAndClearAllIteratorStates(EXPLICIT_ABORT_TOKEN);
            if (webSocket.readyState !== WebSocket.CLOSED && webSocket.readyState !== WebSocket.CLOSING) {
                webSocket.close(1000);
            }
        }
        function handleClose(ev: CloseEvent) {
            bufferDrainWatcher?.onCancel();
            signal.removeEventListener('abort', handleAbort);
            webSocket.removeEventListener('close', handleClose);
            webSocket.removeEventListener('error', handleError);
            webSocket.removeEventListener('open', handleOpen);
            webSocket.removeEventListener('message', handleMessage);
            errorAndClearAllIteratorStates(ev);
        }
        function handleError(ev: Event) {
            if (!hasConnected) {
                reject(
                    new SolanaError(SOLANA_ERROR__RPC_SUBSCRIPTIONS__TRANSPORT_FAILED_TO_CONNECT, {
                        errorEvent: ev,
                    }),
                );
            }
        }
        let hasConnected = false;
        let bufferDrainWatcher: Readonly<{ onCancel(): void; promise: Promise<void> }> | undefined;
        function handleOpen() {
            hasConnected = true;
            resolve({
                async send(payload: unknown) {
                    const message = JSON.stringify(payload);
                    if (
                        !bufferDrainWatcher &&
                        webSocket.readyState === WebSocket.OPEN &&
                        webSocket.bufferedAmount > sendBufferHighWatermark
                    ) {
                        let onCancel: () => void;
                        const promise = new Promise<void>((resolve, reject) => {
                            const intervalId = setInterval(() => {
                                if (
                                    webSocket.readyState !== WebSocket.OPEN ||
                                    !(webSocket.bufferedAmount > sendBufferHighWatermark)
                                ) {
                                    clearInterval(intervalId);
                                    bufferDrainWatcher = undefined;
                                    resolve();
                                }
                            }, 16);
                            onCancel = () => {
                                bufferDrainWatcher = undefined;
                                clearInterval(intervalId);
                                reject(
                                    new SolanaError(
                                        SOLANA_ERROR__RPC_SUBSCRIPTIONS__TRANSPORT_CLOSED_BEFORE_MESSAGE_BUFFERED,
                                    ),
                                );
                            };
                        });
                        bufferDrainWatcher = {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            onCancel,
                            promise,
                        };
                    }
                    if (bufferDrainWatcher) {
                        await bufferDrainWatcher.promise;
                    }
                    webSocket.send(message);
                },
                async *[Symbol.asyncIterator]() {
                    const iteratorKey = Symbol();
                    iteratorState.set(iteratorKey, { __hasPolled: false, queuedMessages: [] });
                    try {
                        while (true) {
                            const state = iteratorState.get(iteratorKey);
                            if (!state) {
                                // There should always be state by now.
                                throw new SolanaError(
                                    SOLANA_ERROR__INVARIANT_VIOLATION__WEBSOCKET_MESSAGE_ITERATOR_STATE_MISSING,
                                );
                            }
                            if (state.__hasPolled) {
                                // You should never be able to poll twice in a row.
                                throw new SolanaError(
                                    SOLANA_ERROR__INVARIANT_VIOLATION__WEBSOCKET_MESSAGE_ITERATOR_MUST_NOT_POLL_BEFORE_RESOLVING_EXISTING_MESSAGE_PROMISE,
                                );
                            }
                            const queuedMessages = state.queuedMessages;
                            if (queuedMessages.length) {
                                state.queuedMessages = [];
                                yield* queuedMessages;
                            } else {
                                try {
                                    yield await new Promise((resolve, reject) => {
                                        iteratorState.set(iteratorKey, {
                                            __hasPolled: true,
                                            onError: reject,
                                            onMessage: resolve,
                                        });
                                    });
                                } catch (e) {
                                    if (e === EXPLICIT_ABORT_TOKEN) {
                                        return;
                                    } else {
                                        throw new SolanaError(
                                            SOLANA_ERROR__RPC_SUBSCRIPTIONS__TRANSPORT_CONNECTION_CLOSED,
                                            {
                                                cause: e,
                                            },
                                        );
                                    }
                                }
                            }
                        }
                    } finally {
                        iteratorState.delete(iteratorKey);
                    }
                },
            });
        }
        function handleMessage({ data }: MessageEvent) {
            const message = JSON.parse(data);
            iteratorState.forEach((state, iteratorKey) => {
                if (state.__hasPolled) {
                    const { onMessage } = state;
                    iteratorState.set(iteratorKey, { __hasPolled: false, queuedMessages: [] });
                    onMessage(message);
                } else {
                    state.queuedMessages.push(message);
                }
            });
        }
        const webSocket = new WebSocket(url);
        webSocket.addEventListener('close', handleClose);
        webSocket.addEventListener('error', handleError);
        webSocket.addEventListener('open', handleOpen);
        webSocket.addEventListener('message', handleMessage);
    });
}
