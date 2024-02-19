import type { Address } from '@solana/addresses';
import type { RpcApiMethods } from '@solana/rpc-spec';
import type { Commitment, LamportsUnsafeBeyond2Pow53Minus1, SolanaRpcResponse } from '@solana/rpc-types';

type GetLargestAccountsResponseItem = Readonly<{
    /** Base-58 encoded address of the account */
    address: Address;
    /** Number of lamports in the account */
    lamports: LamportsUnsafeBeyond2Pow53Minus1;
}>;

type GetLargestAccountsApiResponse = SolanaRpcResponse<GetLargestAccountsResponseItem[]>;

export interface GetLargestAccountsApi extends RpcApiMethods {
    /**
     * Returns the 20 largest accounts, by lamport balance
     * (results may be cached up to two hours)
     */
    getLargestAccounts(
        config?: Readonly<{
            commitment?: Commitment;
            /** Filter results by account type */
            filter?: 'circulating' | 'nonCirculating';
        }>,
    ): GetLargestAccountsApiResponse;
}
