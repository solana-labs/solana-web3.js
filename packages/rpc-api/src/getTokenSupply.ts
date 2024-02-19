import type { Address } from '@solana/addresses';
import type { RpcApiMethods } from '@solana/rpc-spec';
import type { Commitment, SolanaRpcResponse, TokenAmount } from '@solana/rpc-types';

type GetTokenSupplyApiResponse = SolanaRpcResponse<TokenAmount>;

export interface GetTokenSupplyApi extends RpcApiMethods {
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
