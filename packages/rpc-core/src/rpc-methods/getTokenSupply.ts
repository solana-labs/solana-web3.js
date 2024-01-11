import { Address } from '@solana/addresses';
import type { IRpcApiMethods } from '@solana/rpc-transport';
import { Commitment, TokenAmount } from '@solana/rpc-types';

import { RpcResponse } from './common';

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
