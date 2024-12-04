import {
    SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_CLOSED_BEFORE_MESSAGE_BUFFERED,
    SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_CONNECTION_CLOSED,
    SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_FAILED_TO_CONNECT,
    SolanaError,
} from '@solana/errors';
import { EventTarget } from '@solana/event-target-impl';
import { RpcSubscriptionsChannel } from '@solana/rpc-subscriptions-spec';
import { getDataPublisherFromEventEmitter } from '@solana/subscribable';
import WebSocket from '@solana/ws-impl';

export type Config = Readonly<{
    sendBufferHighWatermark: number;
    signal: AbortSignal;
    url: string;
}>;

type WebSocketMessage = ArrayBufferLike | ArrayBufferView | Blob | string;

const NORMAL_CLOSURE_CODE = 1000; // https://www.rfc-editor.org/rfc/rfc6455.html#section-7.4.1

export function createWebSocketChannel({
    sendBufferHighWatermark,
    signal,
    url,
}: Config): Promise<RpcSubscriptionsChannel<WebSocketMessage, string>> {
    if (signal.aborted) {
        return Promise.reject(signal.reason);
    }
    let bufferDrainWatcher: Readonly<{ onCancel(): void; promise: Promise<void> }> | undefined;
    let hasConnected = false;
    const listenerRemovers = new Set<() => void>();
    function cleanupListeners() {
        listenerRemovers.forEach(r => {
            r();
        });
        listenerRemovers.clear();
    }
    function handleAbort() {
        cleanupListeners();
        if (!hasConnected) {
            rejectOpen(signal.reason);
        }
        if (webSocket.readyState !== WebSocket.CLOSED && webSocket.readyState !== WebSocket.CLOSING) {
            webSocket.close(NORMAL_CLOSURE_CODE);
        }
    }
    function handleClose(ev: CloseEvent) {
        cleanupListeners();
        bufferDrainWatcher?.onCancel();
        signal.removeEventListener('abort', handleAbort);
        webSocket.removeEventListener('close', handleClose);
        webSocket.removeEventListener('error', handleError);
        webSocket.removeEventListener('message', handleMessage);
        webSocket.removeEventListener('open', handleOpen);
        if (!signal.aborted && !(ev.wasClean && ev.code === NORMAL_CLOSURE_CODE)) {
            eventTarget.dispatchEvent(
                new CustomEvent('error', {
                    detail: new SolanaError(SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_CONNECTION_CLOSED, {
                        cause: ev,
                    }),
                }),
            );
        }
    }
    function handleError(ev: Event) {
        if (signal.aborted) {
            return;
        }
        if (!hasConnected) {
            const failedToConnectError = new SolanaError(SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_FAILED_TO_CONNECT, {
                errorEvent: ev,
            });
            rejectOpen(failedToConnectError);
            eventTarget.dispatchEvent(
                new CustomEvent('error', {
                    detail: failedToConnectError,
                }),
            );
        }
    }
    function handleMessage(ev: MessageEvent) {
        if (signal.aborted) {
            return;
        }
        eventTarget.dispatchEvent(new CustomEvent('message', { detail: ev.data }));
    }
    const eventTarget = new EventTarget();
    const dataPublisher = getDataPublisherFromEventEmitter(eventTarget);
    function handleOpen() {
        hasConnected = true;
        resolveOpen({
            ...dataPublisher,
            async send(message) {
                if (webSocket.readyState !== WebSocket.OPEN) {
                    throw new SolanaError(SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_CONNECTION_CLOSED);
                }
                if (!bufferDrainWatcher && webSocket.bufferedAmount > sendBufferHighWatermark) {
                    let onCancel!: () => void;
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
                                    SOLANA_ERROR__RPC_SUBSCRIPTIONS__CHANNEL_CLOSED_BEFORE_MESSAGE_BUFFERED,
                                ),
                            );
                        };
                    });
                    bufferDrainWatcher = {
                        onCancel,
                        promise,
                    };
                }
                if (bufferDrainWatcher) {
                    if (ArrayBuffer.isView(message) && !(message instanceof DataView)) {
                        const TypedArrayConstructor = message.constructor as {
                            new (...args: [typeof message]): typeof message;
                        };
                        // Clone the message to prevent mutation while queued.
                        message = new TypedArrayConstructor(message);
                    }
                    await bufferDrainWatcher.promise;
                }
                webSocket.send(message);
            },
        });
    }
    const webSocket = new WebSocket(url);
    signal.addEventListener('abort', handleAbort);
    webSocket.addEventListener('close', handleClose);
    webSocket.addEventListener('error', handleError);
    webSocket.addEventListener('message', handleMessage);
    webSocket.addEventListener('open', handleOpen);
    let rejectOpen!: (e: SolanaError) => void;
    let resolveOpen!: (value: RpcSubscriptionsChannel<WebSocketMessage, string>) => void;
    return new Promise<RpcSubscriptionsChannel<WebSocketMessage, string>>((resolve, reject) => {
        rejectOpen = reject;
        resolveOpen = resolve;
    });
}
