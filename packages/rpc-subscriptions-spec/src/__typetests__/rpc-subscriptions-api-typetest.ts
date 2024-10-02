import { createRpcSubscriptionsApi, RpcSubscriptionsApi } from '../rpc-subscriptions-api';

type NftCollectionDetailsApiResponse = Readonly<{
    address: string;
    circulatingSupply: number;
    description: string;
    erc1155: boolean;
    erc721: boolean;
    genesisBlock: string;
    genesisTransaction: string;
    name: string;
    totalSupply: number;
}>;

type NftCollectionDetailsApi = {
    qn_fetchNFTCollectionDetails(args: { contracts: string[] }): NftCollectionDetailsApiResponse;
};

type QuickNodeRpcMethods = NftCollectionDetailsApi;

createRpcSubscriptionsApi<QuickNodeRpcMethods>(
    ...(null as unknown as Parameters<typeof createRpcSubscriptionsApi>),
) satisfies RpcSubscriptionsApi<QuickNodeRpcMethods>;
