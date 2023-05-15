import { Slot, U64UnsafeBeyond2Pow53Minus1 } from './common';

type PerformanceSample = Readonly<{
    /** Slot in which sample was taken at */
    slot: Slot;
    /** Number of transactions in sample */
    numTransactions: U64UnsafeBeyond2Pow53Minus1;
    /** Number of slots in sample */
    numSlots: U64UnsafeBeyond2Pow53Minus1;
    /** Number of seconds in a sample window */
    samplePeriodSecs: number;
    /** Number of non-vote transactions in sample. */
    numNonVoteTransaction: U64UnsafeBeyond2Pow53Minus1;
}>;

type GetRecentPerformanceSamplesApiResponse = readonly PerformanceSample[];

export interface GetRecentPerformanceSamplesApi {
    /**
     * Returns a list of recent performance samples, in reverse slot order. Performance samples are taken every 60 seconds and include the number of transactions and slots that occur in a given time window.
     */
    getRecentPerformanceSamples(
        /** number of samples to return (maximum 720) */
        limit?: number
    ): GetRecentPerformanceSamplesApiResponse;
}
