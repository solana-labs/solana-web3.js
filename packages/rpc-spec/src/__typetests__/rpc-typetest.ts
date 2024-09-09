import { createRpc, Rpc } from '../rpc';
import { createRpcApi } from '../rpc-api';
import { RpcTransport } from '../rpc-transport';

type MyApiMethods = {
    bar(): string;
    foo(): number;
};

const api = createRpcApi<MyApiMethods>();
const transport = null as unknown as RpcTransport;

createRpc({ api, transport }) satisfies Rpc<MyApiMethods>;
