import type { Lamports, Slot } from '@solana/rpc-types';

type GetBlockCommitmentApiResponse = Readonly<{
    commitment: Lamports[] | null;
    totalStake: Lamports;
}>;

export type GetBlockCommitmentApi = {
    /**
     * Returns the amount of cluster stake in lamports that has voted on
     * a particular block, as well as the stake attributed to each vote account
     */
    getBlockCommitment(slot: Slot): GetBlockCommitmentApiResponse;
};
