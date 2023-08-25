import { Base58EncodedAddress } from '@solana/addresses';

import { Commitment, RpcResponse, TokenAmount } from './common';

type GetTokenAccountBalanceApiResponse = RpcResponse<TokenAmount>;

export interface GetTokenAccountBalanceApi {
    /**
     * Returns the token balance of an SPL Token account
     */
    getTokenAccountBalance(
        /** Pubkey of Token account to query, as base-58 encoded string */
        address: Base58EncodedAddress,
        config?: Readonly<{
            commitment?: Commitment;
        }>
    ): GetTokenAccountBalanceApiResponse;
}
