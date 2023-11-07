import { Address } from '@solana/addresses';
import { Commitment } from '@solana/rpc-types';

import { RpcResponse, TokenAmount } from './common';

type GetTokenSupplyApiResponse = RpcResponse<TokenAmount>;

export interface GetTokenSupplyApi {
    /**
     * Returns the total supply of an SPL Token mint
     */
    getTokenSupply(
        /** Pubkey of the token Mint to query, as base-58 encoded string */
        address: Address,
        config?: Readonly<{
            commitment?: Commitment;
        }>
    ): GetTokenSupplyApiResponse;
}
