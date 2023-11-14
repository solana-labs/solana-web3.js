import { Address } from '@solana/addresses';
import type { IRpcApiMethods } from '@solana/rpc-transport';
import { Commitment, LamportsUnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';

import { RpcResponse } from './common';

type GetLargestAccountsResponseItem = Readonly<{
    /** Base-58 encoded address of the account */
    address: Address;
    /** Number of lamports in the account */
    lamports: LamportsUnsafeBeyond2Pow53Minus1;
}>;

type GetLargestAccountsApiResponse = RpcResponse<GetLargestAccountsResponseItem[]>;

export interface GetLargestAccountsApi extends IRpcApiMethods {
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
