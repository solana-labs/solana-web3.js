import { Base58EncodedAddress } from '@solana/addresses';

import { Commitment, RpcResponse } from './common';

type GetTokenAccountBalanceApiResponse = RpcResponse<{
    /** The raw balance without decimals, a string representation of u64 */
    amount: string;
    /** Number of base 10 digits to the right of the decimal place */
    decimals: number;
    /** @deprecated The balance, using mint-prescribed decimals */
    uiAmount: number | null;
    /** The balance as a string, using mint-prescribed decimals */
    uiAmountString: string;
}>;

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
