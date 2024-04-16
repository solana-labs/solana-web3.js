// When building the browser bundle, this import gets replaced by `globalThis.WebSocket`.
import WebSocketImpl from 'ws';

export default globalThis.WebSocket
    ? globalThis.WebSocket // Use native `WebSocket` in runtimes that support it (eg. Deno)
    : WebSocketImpl;
