import { IRpcWebSocketTransport } from '@solana/rpc-transport/dist/types/transports/transport-types';

type Config = Readonly<{
    intervalMs: number;
    transport: IRpcWebSocketTransport;
}>;

const PING_PAYLOAD = {
    jsonrpc: '2.0',
    method: 'ping',
} as const;

export function getWebSocketTransportWithAutoping({ intervalMs, transport }: Config): IRpcWebSocketTransport {
    const pingableConnections = new Map<
        Awaited<ReturnType<IRpcWebSocketTransport>>,
        Awaited<ReturnType<IRpcWebSocketTransport>>
    >();
    return async (...args) => {
        const connection = await transport(...args);
        let intervalId: string | number | NodeJS.Timeout | undefined;
        function restartPingTimer() {
            clearInterval(intervalId);
            intervalId = setInterval(() => {
                connection.send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(PING_PAYLOAD);
            }, intervalMs);
        }
        if (pingableConnections.has(connection) === false) {
            pingableConnections.set(connection, {
                [Symbol.asyncIterator]: connection[Symbol.asyncIterator].bind(connection),
                send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: (
                    ...args: Parameters<typeof connection.send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED>
                ) => {
                    restartPingTimer();
                    return connection.send_DO_NOT_USE_OR_YOU_WILL_BE_FIRED(...args);
                },
            });
            (async () => {
                try {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    for await (const _ of connection) {
                        restartPingTimer();
                    }
                } catch {
                    /* empty */
                } finally {
                    pingableConnections.delete(connection);
                    clearInterval(intervalId);
                }
            })();
            restartPingTimer();
        }
        return pingableConnections.get(connection)!;
    };
}
