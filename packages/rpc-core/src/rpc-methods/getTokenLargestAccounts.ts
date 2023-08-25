import { Base58EncodedAddress } from '@solana/addresses';

import { Commitment, RpcResponse, TokenAmount } from './common';

type GetTokenLargestAccountsApiResponse = RpcResponse<TokenAmount & { address: Base58EncodedAddress }[]>;

export interface GetTokenLargestAccountsApi {
    /**
     * Returns the 20 largest accounts of a particular SPL Token type.
     */
    getTokenLargestAccounts(
        tokenMint: Base58EncodedAddress,
        config?: Readonly<{
            commitment?: Commitment;
        }>
    ): GetTokenLargestAccountsApiResponse;
}
