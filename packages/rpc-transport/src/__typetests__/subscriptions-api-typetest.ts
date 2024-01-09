import { IRpcApiMethods } from '../apis/api-types';
import { createJsonRpcSubscriptionsApi } from '../apis/subscriptions/subscriptions-api';
import { IRpcSubscriptionsApi } from '../json-rpc-types';

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

createJsonRpcSubscriptionsApi<QuickNodeRpcMethods>() satisfies IRpcSubscriptionsApi<QuickNodeRpcMethods>;
