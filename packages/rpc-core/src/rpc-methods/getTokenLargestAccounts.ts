import { Address } from '@solana/addresses';
import { Commitment } from '@solana/rpc-types';

import { RpcResponse, TokenAmount } from './common.js';

type GetTokenLargestAccountsApiResponse = RpcResponse<TokenAmount & { address: Address }[]>;

export interface GetTokenLargestAccountsApi {
    /**
     * Returns the 20 largest accounts of a particular SPL Token type.
     */
    getTokenLargestAccounts(
        tokenMint: Address,
        config?: Readonly<{
            commitment?: Commitment;
        }>
    ): GetTokenLargestAccountsApiResponse;
}
