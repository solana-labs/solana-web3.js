import { devnet, IRpcApiMethods, mainnet, Rpc, testnet } from '@solana/rpc-types';

import { createJsonRpcApi } from '../apis/methods/methods-api';
import { createJsonRpc } from '../json-rpc';
import { RpcDevnet, RpcMainnet, RpcTestnet } from '../json-rpc-types';
import { createHttpTransport } from '../transports/http/http-transport';

interface MyApiMethods extends IRpcApiMethods {
    foo(): number;
    bar(): string;
}

const api = createJsonRpcApi<MyApiMethods>();

const genericTransport = createHttpTransport({ url: 'http://localhost:8899' });
const devnetTransport = createHttpTransport({ url: devnet('https://api.devnet.solana.com') });
const testnetTransport = createHttpTransport({ url: testnet('https://api.testnet.solana.com') });
const mainnetTransport = createHttpTransport({ url: mainnet('https://api.mainnet-beta.solana.com') });

// When providing a generic transport, the RPC should be typed as an Rpc
createJsonRpc({ api, transport: genericTransport }) satisfies Rpc<MyApiMethods>;
//@ts-expect-error Should not be a devnet RPC
createJsonRpc({ api, transport: genericTransport }) satisfies RpcDevnet<MyApiMethods>;
//@ts-expect-error Should not be a testnet RPC
createJsonRpc({ api, transport: genericTransport }) satisfies RpcTestnet<MyApiMethods>;
//@ts-expect-error Should not be a mainnet RPC
createJsonRpc({ api, transport: genericTransport }) satisfies RpcMainnet<MyApiMethods>;

// When providing a devnet transport, the RPC should be typed as an RpcDevnet
createJsonRpc({ api, transport: devnetTransport }) satisfies RpcDevnet<MyApiMethods>;
//@ts-expect-error Should not be a testnet RPC
createJsonRpc({ api, transport: devnetTransport }) satisfies RpcTestnet<MyApiMethods>;
//@ts-expect-error Should not be a mainnet RPC
createJsonRpc({ api, transport: devnetTransport }) satisfies RpcMainnet<MyApiMethods>;

// When providing a testnet transport, the RPC should be typed as an RpcTestnet
createJsonRpc({ api, transport: testnetTransport }) satisfies RpcTestnet<MyApiMethods>;
//@ts-expect-error Should not be a devnet RPC
createJsonRpc({ api, transport: testnetTransport }) satisfies RpcDevnet<MyApiMethods>;
//@ts-expect-error Should not be a mainnet RPC
createJsonRpc({ api, transport: testnetTransport }) satisfies RpcMainnet<MyApiMethods>;

// When providing a mainnet transport, the RPC should be typed as an RpcMainnet
createJsonRpc({ api, transport: mainnetTransport }) satisfies RpcMainnet<MyApiMethods>;
//@ts-expect-error Should not be a devnet RPC
createJsonRpc({ api, transport: mainnetTransport }) satisfies RpcDevnet<MyApiMethods>;
//@ts-expect-error Should not be a testnet RPC
createJsonRpc({ api, transport: mainnetTransport }) satisfies RpcTestnet<MyApiMethods>;
