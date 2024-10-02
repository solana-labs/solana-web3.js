import type { RpcSubscriptionsChannel } from '@solana/rpc-subscriptions-spec';

type Config<TChannel extends RpcSubscriptionsChannel<unknown, unknown>> = Readonly<{
    abortSignal: AbortSignal;
    channel: TChannel;
    intervalMs: number;
}>;

const PING_PAYLOAD = {
    jsonrpc: '2.0',
    method: 'ping',
} as const;

export function getRpcSubscriptionsChannelWithAutoping<TChannel extends RpcSubscriptionsChannel<object, unknown>>({
    abortSignal: callerAbortSignal,
    channel,
    intervalMs,
}: Config<TChannel>): TChannel {
    let intervalId: ReturnType<typeof setInterval> | undefined;
    function sendPing() {
        channel.send(PING_PAYLOAD);
    }
    function restartPingTimer() {
        clearInterval(intervalId);
        intervalId = setInterval(sendPing, intervalMs);
    }
    const pingerAbortController = new AbortController();
    pingerAbortController.signal.addEventListener('abort', () => {
        clearInterval(intervalId);
    });
    callerAbortSignal.addEventListener('abort', () => {
        pingerAbortController.abort();
    });
    channel.on(
        'error',
        () => {
            pingerAbortController.abort();
        },
        { signal: pingerAbortController.signal },
    );
    channel.on('message', restartPingTimer, { signal: pingerAbortController.signal });
    if (!__BROWSER__ || globalThis.navigator.onLine) {
        restartPingTimer();
    }
    if (__BROWSER__) {
        globalThis.window.addEventListener(
            'offline',
            function handleOffline() {
                clearInterval(intervalId);
            },
            { signal: pingerAbortController.signal },
        );
        globalThis.window.addEventListener(
            'online',
            function handleOnline() {
                sendPing();
                restartPingTimer();
            },
            { signal: pingerAbortController.signal },
        );
    }
    return {
        ...channel,
        send(...args) {
            if (!pingerAbortController.signal.aborted) {
                restartPingTimer();
            }
            return channel.send(...args);
        },
    };
}
