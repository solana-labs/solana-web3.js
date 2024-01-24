import type { Address } from '@solana/addresses';
import type { Commitment, IRpcApiMethods, RpcResponse, TokenAmount } from '@solana/rpc-types';

type GetTokenSupplyApiResponse = RpcResponse<TokenAmount>;

export interface GetTokenSupplyApi extends IRpcApiMethods {
    /**
     * Returns the total supply of an SPL Token mint
     */
    getTokenSupply(
        /** Pubkey of the token Mint to query, as base-58 encoded string */
        address: Address,
        config?: Readonly<{
            commitment?: Commitment;
        }>,
    ): GetTokenSupplyApiResponse;
}
