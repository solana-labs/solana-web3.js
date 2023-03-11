import { createJsonRpcTransport } from './json-rpc-transport';

export interface IJsonRpcTransport {
    send<TParams, TResponse>(method: string, params: TParams): Promise<TResponse>;
}

export { createJsonRpcTransport };
