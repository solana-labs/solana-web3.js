import { Address } from '@solana/addresses';
import type { IRpcApiMethods } from '@solana/rpc-types';
import { Commitment, TokenAmount } from '@solana/rpc-types';

import { RpcResponse } from './common';

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
