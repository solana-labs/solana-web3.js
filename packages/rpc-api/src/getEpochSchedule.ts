import type { RpcApiMethods } from '@solana/rpc-spec';
import type { U64UnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';

type GetEpochScheduleApiResponse = Readonly<{
    /** first normal-length epoch, log2(slotsPerEpoch) - log2(MINIMUM_SLOTS_PER_EPOCH) */
    firstNormalEpoch: U64UnsafeBeyond2Pow53Minus1;
    /** MINIMUM_SLOTS_PER_EPOCH * (2^(firstNormalEpoch) - 1) */
    firstNormalSlot: U64UnsafeBeyond2Pow53Minus1;
    /** the number of slots before beginning of an epoch to calculate a leader schedule for that epoch */
    leaderScheduleSlotOffset: U64UnsafeBeyond2Pow53Minus1;
    /** the maximum number of slots in each epoch */
    slotsPerEpoch: U64UnsafeBeyond2Pow53Minus1;
    /** whether epochs start short and grow */
    warmup: boolean;
}>;

export interface GetEpochScheduleApi extends RpcApiMethods {
    /**
     * Returns the epoch schedule information from this cluster's genesis config
     * Note that the optional NO_CONFIG object is ignored. See https://github.com/solana-labs/solana-web3.js/issues/1389
     */
    getEpochSchedule(
        // FIXME: https://github.com/solana-labs/solana-web3.js/issues/1389
        NO_CONFIG?: Record<string, never>,
    ): GetEpochScheduleApiResponse;
}
