import type { Address } from '@solana/addresses';
import type { RpcApiMethods } from '@solana/rpc-spec';
import type { Commitment, SolanaRpcResponse, TokenAmount } from '@solana/rpc-types';

type GetTokenLargestAccountsApiResponse = SolanaRpcResponse<{ address: Address }[] & TokenAmount>;

export interface GetTokenLargestAccountsApi extends RpcApiMethods {
    /**
     * Returns the 20 largest accounts of a particular SPL Token type.
     */
    getTokenLargestAccounts(
        tokenMint: Address,
        config?: Readonly<{
            commitment?: Commitment;
        }>,
    ): GetTokenLargestAccountsApiResponse;
}
