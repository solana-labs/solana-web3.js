type GetEpochScheduleApiResponse = Readonly<{
    /** first normal-length epoch, log2(slotsPerEpoch) - log2(MINIMUM_SLOTS_PER_EPOCH) */
    firstNormalEpoch: bigint;
    /** MINIMUM_SLOTS_PER_EPOCH * (2^(firstNormalEpoch) - 1) */
    firstNormalSlot: bigint;
    /** the number of slots before beginning of an epoch to calculate a leader schedule for that epoch */
    leaderScheduleSlotOffset: bigint;
    /** the maximum number of slots in each epoch */
    slotsPerEpoch: bigint;
    /** whether epochs start short and grow */
    warmup: boolean;
}>;

export type GetEpochScheduleApi = {
    /**
     * Returns the epoch schedule information from this cluster's genesis config
     * Note that the optional NO_CONFIG object is ignored. See https://github.com/solana-labs/solana-web3.js/issues/1389
     */
    getEpochSchedule(
        // FIXME: https://github.com/solana-labs/solana-web3.js/issues/1389
        NO_CONFIG?: Record<string, never>,
    ): GetEpochScheduleApiResponse;
};
