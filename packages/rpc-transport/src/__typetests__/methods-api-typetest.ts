import { IRpcApiMethods } from '../apis/api-types';
import { createJsonRpcApi } from '../apis/methods/methods-api';
import { IRpcApi } from '../json-rpc-types';

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
