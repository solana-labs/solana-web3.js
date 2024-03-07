import { createRpc, Rpc } from '../rpc';
import { createRpcApi, RpcApiMethods } from '../rpc-api';
import { RpcTransport } from '../rpc-transport';

interface MyApiMethods extends RpcApiMethods {
    bar(): string;
    foo(): number;
}

const api = createRpcApi<MyApiMethods>();
const transport = null as unknown as RpcTransport;

createRpc({ api, transport }) satisfies Rpc<MyApiMethods>;
