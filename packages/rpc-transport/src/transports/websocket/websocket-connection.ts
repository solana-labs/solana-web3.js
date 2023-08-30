import WebSocket from 'ws-impl';

type Config = Readonly<{
    signal: AbortSignal;
    url: string;
}>;
type IteratorKey = symbol;
type IteratorState =
    | {
          __hasPolled: true;
          onMessage: Parameters<ConstructorParameters<typeof Promise>[0]>[0];
          onError: Parameters<ConstructorParameters<typeof Promise>[0]>[1];
      }
    | {
          __hasPolled: false;
          queuedMessages: unknown[];
      };
export type RpcWebSocketConnection = Readonly<{
    send(payload: unknown): Promise<void>;
    [Symbol.asyncIterator](): AsyncGenerator<unknown>;
}>;

export async function createWebSocketConnection({ signal, url }: Config): Promise<RpcWebSocketConnection> {
    return new Promise((resolve, reject) => {
        signal.addEventListener('abort', handleAbort, { once: true });
        const iteratorState: Map<IteratorKey, IteratorState> = new Map();
        function handleAbort() {
            if (webSocket.readyState !== WebSocket.CLOSED && webSocket.readyState !== WebSocket.CLOSING) {
                webSocket.close(1000);
            }
        }
        function handleClose(ev: CloseEvent) {
            signal.removeEventListener('abort', handleAbort);
            webSocket.removeEventListener('close', handleClose);
            webSocket.removeEventListener('error', handleError);
            webSocket.removeEventListener('open', handleOpen);
            webSocket.removeEventListener('message', handleMessage);
            iteratorState.forEach((state, iteratorKey) => {
                if (state.__hasPolled) {
                    const { onError } = state;
                    iteratorState.delete(iteratorKey);
                    onError(ev);
                } else {
                    iteratorState.delete(iteratorKey);
                }
            });
        }
        function handleError(ev: Event) {
            if (!hasConnected) {
                reject(
                    // TODO: Coded error
                    new Error('WebSocket failed to connect', { cause: ev })
                );
            }
        }
        let hasConnected = false;
        function handleOpen() {
            hasConnected = true;
            resolve({
                async send(payload: unknown) {
                    const message = JSON.stringify(payload);
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
                                throw new Error('Invariant: WebSocket message iterator is missing state storage');
                            }
                            if (state.__hasPolled) {
                                // You should never be able to poll twice in a row.
                                throw new Error(
                                    'Invariant: WebSocket message iterator state is corrupt; ' +
                                        'iterated without first resolving existing message promise'
                                );
                            }
                            const queuedMessages = state.queuedMessages;
                            if (queuedMessages.length) {
                                state.queuedMessages = [];
                                yield* queuedMessages;
                            } else {
                                try {
                                    yield await new Promise((onMessage, onError) => {
                                        iteratorState.set(iteratorKey, {
                                            __hasPolled: true,
                                            onError,
                                            onMessage,
                                        });
                                    });
                                } catch (e) {
                                    if (
                                        e !== null &&
                                        typeof e === 'object' &&
                                        'type' in e &&
                                        e.type === 'close' &&
                                        'wasClean' in e &&
                                        e.wasClean
                                    ) {
                                        return;
                                    } else {
                                        // TODO: Coded error.
                                        throw new Error('WebSocket connection closed', { cause: e });
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
