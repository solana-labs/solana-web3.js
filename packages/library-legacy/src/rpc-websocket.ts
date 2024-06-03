import RpcWebSocketCommonClient from 'rpc-websockets/dist/lib/client.cjs';
import WebSocketBrowserImpl from 'rpc-websockets/dist/lib/client/websocket.cjs';
import {
  ICommonWebSocket,
  IWSClientAdditionalOptions,
  NodeWebSocketType,
  NodeWebSocketTypeOptions,
} from 'rpc-websockets/dist/lib/client/client.types.cjs';

import createRpc from './rpc-websocket-factory';

interface IHasReadyState {
  readyState: WebSocket['readyState'];
}

export default class RpcWebSocketClient extends RpcWebSocketCommonClient {
  private underlyingSocket: IHasReadyState | undefined;
  constructor(
    address?: string,
    options?: IWSClientAdditionalOptions & NodeWebSocketTypeOptions,
    generate_request_id?: (
      method: string,
      params: object | Array<any>,
    ) => number,
  ) {
    const webSocketFactory = (url: string) => {
      const rpc = createRpc(url, {
        autoconnect: true,
        max_reconnects: 5,
        reconnect: true,
        reconnect_interval: 1000,
        ...options,
      });
      if ('socket' in rpc) {
        this.underlyingSocket = rpc.socket as ReturnType<
          typeof WebSocketBrowserImpl
        >;
      } else {
        this.underlyingSocket = rpc as NodeWebSocketType;
      }
      return rpc as ICommonWebSocket;
    };
    super(webSocketFactory, address, options, generate_request_id);
  }
  call(
    ...args: Parameters<RpcWebSocketCommonClient['call']>
  ): ReturnType<RpcWebSocketCommonClient['call']> {
    const readyState = this.underlyingSocket?.readyState;
    if (readyState === 1 /* WebSocket.OPEN */) {
      return super.call(...args);
    }
    return Promise.reject(
      new Error(
        'Tried to call a JSON-RPC method `' +
          args[0] +
          '` but the socket was not `CONNECTING` or `OPEN` (`readyState` was ' +
          readyState +
          ')',
      ),
    );
  }
  notify(
    ...args: Parameters<RpcWebSocketCommonClient['notify']>
  ): ReturnType<RpcWebSocketCommonClient['notify']> {
    const readyState = this.underlyingSocket?.readyState;
    if (readyState === 1 /* WebSocket.OPEN */) {
      return super.notify(...args);
    }
    return Promise.reject(
      new Error(
        'Tried to send a JSON-RPC notification `' +
          args[0] +
          '` but the socket was not `CONNECTING` or `OPEN` (`readyState` was ' +
          readyState +
          ')',
      ),
    );
  }
}
