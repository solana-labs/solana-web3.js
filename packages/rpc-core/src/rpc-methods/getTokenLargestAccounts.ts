import { Base58EncodedAddress } from '@solana/addresses';

import { StringifiedBigInt } from '../stringified-bigint';
import { Commitment, RpcResponse } from './common';

type GetTokenLargestAccountsApiResponse = RpcResponse<
    {
        /** the address of the token account */
        address: Base58EncodedAddress;
        /** the raw token account balance without decimals, a string representation of u64 */
        amount: StringifiedBigInt;
        /** number of base 10 digits to the right of the decimal place */
        decimals: number;
        /**
         * the token account balance, using mint-prescribed decimals
         * @deprecated
         */
        uiAmount: number | null;
        /** the token account balance as a string, using mint-prescribed decimals */
        uiAmountString: string;
    }[]
>;

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
