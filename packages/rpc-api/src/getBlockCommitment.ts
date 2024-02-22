import type { RpcApiMethods } from '@solana/rpc-spec';
import type { LamportsUnsafeBeyond2Pow53Minus1, Slot } from '@solana/rpc-types';

type GetBlockCommitmentApiResponse = Readonly<{
    commitment: LamportsUnsafeBeyond2Pow53Minus1[] | null;
    totalStake: LamportsUnsafeBeyond2Pow53Minus1;
}>;

export interface GetBlockCommitmentApi extends RpcApiMethods {
    /**
     * Returns the amount of cluster stake in lamports that has voted on
     * a particular block, as well as the stake attributed to each vote account
     */
    getBlockCommitment(slot: Slot): GetBlockCommitmentApiResponse;
}
