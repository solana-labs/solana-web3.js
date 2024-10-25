import type { Slot, U64 } from '@solana/rpc-types';

type PerformanceSample = Readonly<{
    /** Number of non-vote transactions in sample. */
    numNonVoteTransactions: U64;
    /** Number of slots in sample */
    numSlots: U64;
    /** Number of transactions in sample */
    numTransactions: U64;
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
