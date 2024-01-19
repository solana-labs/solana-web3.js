import type { Address } from '@solana/addresses';
import type { Commitment, IRpcApiMethods, RpcResponse, TokenAmount } from '@solana/rpc-types';

type GetTokenAccountBalanceApiResponse = RpcResponse<TokenAmount>;

export interface GetTokenAccountBalanceApi extends IRpcApiMethods {
    /**
     * Returns the token balance of an SPL Token account
     */
    getTokenAccountBalance(
        /** Pubkey of Token account to query, as base-58 encoded string */
        address: Address,
        config?: Readonly<{
            commitment?: Commitment;
        }>,
    ): GetTokenAccountBalanceApiResponse;
}
