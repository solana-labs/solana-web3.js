import type { Address } from '@solana/addresses';
import type { Commitment, Lamports, SolanaRpcResponse } from '@solana/rpc-types';

type GetLargestAccountsResponseItem = Readonly<{
    /** Base-58 encoded address of the account */
    address: Address;
    /** Number of lamports in the account */
    lamports: Lamports;
}>;

type GetLargestAccountsApiResponse = readonly GetLargestAccountsResponseItem[];

export type GetLargestAccountsApi = {
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
    ): SolanaRpcResponse<GetLargestAccountsApiResponse>;
};
