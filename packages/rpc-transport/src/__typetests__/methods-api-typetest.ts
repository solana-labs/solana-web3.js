import { IRpcApiMethods, IRpcApiMethodsDevnet, IRpcApiMethodsMainnet, IRpcApiMethodsTestnet } from '../apis/api-types';
import { createJsonRpcApi } from '../apis/methods/methods-api';
import { createJsonRpc } from '../json-rpc';
import {
    IRpcApi,
    IRpcApiDevnet,
    IRpcApiMainnet,
    IRpcApiTestnet,
    RpcDevnet,
    RpcMainnet,
    RpcTestnet,
} from '../json-rpc-types';

type NftCollectionDetailsApiResponse = Readonly<{
    address: string;
    circulatingSupply: number;
    description: string;
    erc721: boolean;
    erc1155: boolean;
    genesisBlock: string;
    genesisTransaction: string;
    name: string;
    totalSupply: number;
}>;

interface NftCollectionDetailsApi extends IRpcApiMethods {
    qn_fetchNFTCollectionDetails(args: { contracts: string[] }): NftCollectionDetailsApiResponse;
}

type QuickNodeRpcMethods = NftCollectionDetailsApi;

createJsonRpcApi<QuickNodeRpcMethods>() satisfies IRpcApi<QuickNodeRpcMethods>;

const configApi = null as unknown as Omit<Parameters<typeof createJsonRpcApi>[0], 'api'>;

interface MyApiMethods extends IRpcApiMethods {
    foo(): void;
}
type MyApiMethodsDevnet = IRpcApiMethodsDevnet<MyApiMethods>;
type MyApiMethodsTestnet = IRpcApiMethodsTestnet<MyApiMethods>;
type MyApiMethodsMainnet = IRpcApiMethodsMainnet<MyApiMethods>;

createJsonRpcApi<MyApiMethodsDevnet>(configApi) satisfies IRpcApi<MyApiMethodsDevnet>;
createJsonRpcApi<MyApiMethodsDevnet>(configApi) satisfies IRpcApiDevnet<MyApiMethodsDevnet>;
// @ts-expect-error Should not be a testnet API
createJsonRpcApi<MyApiMethodsDevnet>(configApi) satisfies IRpcApiTestnet<MyApiMethodsDevnet>;
// @ts-expect-error Should not be a mainnet API
createJsonRpcApi<MyApiMethodsDevnet>(configApi) satisfies IRpcApiMainnet<MyApiMethodsDevnet>;

createJsonRpcApi<MyApiMethodsTestnet>(configApi) satisfies IRpcApi<MyApiMethodsTestnet>;
createJsonRpcApi<MyApiMethodsTestnet>(configApi) satisfies IRpcApiTestnet<MyApiMethodsTestnet>;
// @ts-expect-error Should not be a devnet API
createJsonRpcApi<MyApiMethodsTestnet>(configApi) satisfies IRpcApiDevnet<MyApiMethodsTestnet>;
// @ts-expect-error Should not be a mainnet API
createJsonRpcApi<MyApiMethodsTestnet>(configApi) satisfies IRpcApiMainnet<MyApiMethodsTestnet>;

createJsonRpcApi<MyApiMethodsMainnet>(configApi) satisfies IRpcApi<MyApiMethodsMainnet>;
createJsonRpcApi<MyApiMethodsMainnet>(configApi) satisfies IRpcApiMainnet<MyApiMethodsMainnet>;
// @ts-expect-error Should not be a devnet API
createJsonRpcApi<MyApiMethodsMainnet>(configApi) satisfies IRpcApiDevnet<MyApiMethodsMainnet>;
// @ts-expect-error Should not be a testnet API
createJsonRpcApi<MyApiMethodsMainnet>(configApi) satisfies IRpcApiTestnet<MyApiMethodsMainnet>;

const transport = null as unknown as Parameters<typeof createJsonRpc>[0]['transport'];

const apiDevnet = createJsonRpcApi<MyApiMethodsDevnet>(configApi);
createJsonRpc<MyApiMethodsDevnet>({ api: apiDevnet, transport }) satisfies RpcDevnet<MyApiMethodsDevnet>;
// @ts-expect-error Should not be a testnet RPC
createJsonRpc<MyApiMethodsDevnet>({ api: apiDevnet, transport }) satisfies RpcTestnet<MyApiMethodsDevnet>;
// @ts-expect-error Should not be a mainnet RPC
createJsonRpc<MyApiMethodsDevnet>({ api: apiDevnet, transport }) satisfies RpcMainnet<MyApiMethodsDevnet>;

const apiTestnet = createJsonRpcApi<MyApiMethodsTestnet>(configApi);
createJsonRpc<MyApiMethodsTestnet>({ api: apiTestnet, transport }) satisfies RpcTestnet<MyApiMethodsTestnet>;
// @ts-expect-error Should not be a devnet RPC
createJsonRpc<MyApiMethodsTestnet>({ api: apiTestnet, transport }) satisfies RpcDevnet<MyApiMethodsTestnet>;
// @ts-expect-error Should not be a mainnet RPC
createJsonRpc<MyApiMethodsTestnet>({ api: apiTestnet, transport }) satisfies RpcMainnet<MyApiMethodsTestnet>;

const apiMainnet = createJsonRpcApi<MyApiMethodsMainnet>(configApi);
createJsonRpc<MyApiMethodsMainnet>({ api: apiMainnet, transport }) satisfies RpcMainnet<MyApiMethodsMainnet>;
// @ts-expect-error Should not be a devnet RPC
createJsonRpc<MyApiMethodsMainnet>({ api: apiMainnet, transport }) satisfies RpcDevnet<MyApiMethodsMainnet>;
// @ts-expect-error Should not be a testnet RPC
createJsonRpc<MyApiMethodsMainnet>({ api: apiMainnet, transport }) satisfies RpcTestnet<MyApiMethodsMainnet>;
