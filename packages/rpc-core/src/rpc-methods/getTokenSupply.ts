import { Base58EncodedAddress } from '@solana/addresses';

import { Commitment, RpcResponse } from './common';

type GetTokenSupplyApiResponse = RpcResponse<{
    /**
     * The raw total token supply without decimals,
     * a string representation of u64
     */
    amount: string;
    /** Number of base 10 digits to the right of the decimal place */
    decimals: number;
    /** @deprecated The total token supply, using mint-prescribed decimals */
    uiAmount: number | null;
    /** The total token supply as a string, using mint-prescribed decimals */
    uiAmountString: string;
}>;

export interface GetTokenSupplyApi {
    /**
     * Returns the total supply of an SPL Token mint
     */
    getTokenSupply(
        /** Pubkey of the token Mint to query, as base-58 encoded string */
        address: Base58EncodedAddress,
        config?: Readonly<{
            commitment?: Commitment;
        }>
    ): GetTokenSupplyApiResponse;
}
