import type { Address } from '@solana/addresses';
import type { RpcApiMethods } from '@solana/rpc-spec';
import type { Commitment, Slot } from '@solana/rpc-types';

type GetLeaderScheduleApiConfigBase = Readonly<{
    commitment?: Commitment;
}>;

/**
 * This return type is a dictionary of validator identities, as base-58 encoded
 * strings, and their corresponding leader slot indices as values
 * (indices are relative to the first slot in the requested epoch)
 * @example
 * ```json
 * {
 *   "4Qkev8aNZcqFNSRhQzwyLMFSsi94jHqE8WNVTJzTP99F": [
 *     0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
 *     21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,
 *     39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56,
 *     57, 58, 59, 60, 61, 62, 63
 *   ]
 * }
 * ```
 */
type GetLeaderScheduleApiResponseWithAllIdentities = Record<Address, Slot[]>;

type GetLeaderScheduleApiResponseWithSingleIdentity<TIdentity extends string> = Readonly<{
    [TAddress in TIdentity]?: Slot[];
}>;

export interface GetLeaderScheduleApi extends RpcApiMethods {
    /**
     * Fetch the leader schedule for the epoch that corresponds to the provided slot.
     * If unspecified, the leader schedule for the current epoch is fetched
     *
     * When a slot is provided, the leader schedule for the epoch that corresponds
     * to the provided slot is returned, and this can be null if the slot corresponds
     * to an epoch that does not exist.
     *
     * The RPC request payload provides a `null` value for `slot` when the slot is not
     * specified but the request wishes to include config.
     */
    getLeaderSchedule<TIdentity extends Address>(
        slot: Slot,
        config: GetLeaderScheduleApiConfigBase &
            Readonly<{
                /** Only return results for this validator identity (base58 encoded address) */
                identity: Address;
            }>,
    ): GetLeaderScheduleApiResponseWithSingleIdentity<TIdentity> | null;
    getLeaderSchedule(
        slot: Slot,
        config?: GetLeaderScheduleApiConfigBase,
    ): GetLeaderScheduleApiResponseWithAllIdentities | null;
    getLeaderSchedule<TIdentity extends Address>(
        slot: null,
        config: GetLeaderScheduleApiConfigBase &
            Readonly<{
                /** Only return results for this validator identity (base58 encoded address) */
                identity: Address;
            }>,
    ): GetLeaderScheduleApiResponseWithSingleIdentity<TIdentity>;
    getLeaderSchedule(
        slot: null,
        config?: GetLeaderScheduleApiConfigBase,
    ): GetLeaderScheduleApiResponseWithAllIdentities;
}
