import { LamportsUnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';

import { Slot } from './common';

type GetBlockCommitmentApiResponse = Readonly<{
    commitment: LamportsUnsafeBeyond2Pow53Minus1[] | null;
    totalStake: LamportsUnsafeBeyond2Pow53Minus1;
}>;

export interface GetBlockCommitmentApi {
    /**
     * Returns the amount of cluster stake in lamports that has voted on
     * a particular block, as well as the stake attributed to each vote account
     */
    getBlockCommitment(slot: Slot): GetBlockCommitmentApiResponse;
}
