import type { Address } from '@solana/addresses';
import type { Commitment, SolanaRpcResponse, TokenAmount } from '@solana/rpc-types';

type TokenLargestAccount = Readonly<{ address: Address }> & TokenAmount;

type GetTokenLargestAccountsApiResponse = readonly TokenLargestAccount[];

export type GetTokenLargestAccountsApi = {
    /**
     * Returns the 20 largest accounts of a particular SPL Token type.
     */
    getTokenLargestAccounts(
        tokenMint: Address,
        config?: Readonly<{
            commitment?: Commitment;
        }>,
    ): SolanaRpcResponse<GetTokenLargestAccountsApiResponse>;
};
