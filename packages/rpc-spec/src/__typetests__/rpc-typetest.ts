import { createRpc, Rpc } from '../rpc.js';
import { createRpcApi, RpcApiMethods } from '../rpc-api.js';
import { RpcTransport } from '../rpc-transport.js';

interface MyApiMethods extends RpcApiMethods {
    bar(): string;
    foo(): number;
}

const api = createRpcApi<MyApiMethods>();
const transport = null as unknown as RpcTransport;

createRpc({ api, transport }) satisfies Rpc<MyApiMethods>;
