import { createRpc, Rpc } from '../rpc';
import { createRpcApi, RpcApiMethods } from '../rpc-api';
import { RpcTransport } from '../rpc-transport';

interface MyApiMethods extends RpcApiMethods {
    foo(): number;
    bar(): string;
}

const api = createRpcApi<MyApiMethods>();
const transport = null as unknown as RpcTransport;

createRpc({ api, transport }) satisfies Rpc<MyApiMethods>;
