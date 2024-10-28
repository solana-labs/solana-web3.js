import type { Slot } from '@solana/rpc-types';

type PerformanceSample = Readonly<{
    /** Number of non-vote transactions in sample. */
    numNonVoteTransactions: bigint;
    /** Number of slots in sample */
    numSlots: bigint;
    /** Number of transactions in sample */
    numTransactions: bigint;
    /** Number of seconds in a sample window */
    samplePeriodSecs: number;
    /** Slot in which sample was taken at */
    slot: Slot;
}>;

type GetRecentPerformanceSamplesApiResponse = readonly PerformanceSample[];

export type GetRecentPerformanceSamplesApi = {
    /**
     * Returns a list of recent performance samples, in reverse slot order. Performance samples are taken every 60 seconds and include the number of transactions and slots that occur in a given time window.
     */
    getRecentPerformanceSamples(
        /** number of samples to return (maximum 720) */
        limit?: number,
    ): GetRecentPerformanceSamplesApiResponse;
};
