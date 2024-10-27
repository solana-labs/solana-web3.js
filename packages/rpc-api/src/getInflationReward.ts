import type { Address } from '@solana/addresses';
import type { Commitment, Lamports, Slot, U64 } from '@solana/rpc-types';

type GetInflationRewardApiConfig = Readonly<{
    // Defaults to `finalized`
    commitment?: Commitment;
    // An epoch for which the reward occurs.
    // If omitted, the previous epoch will be used
    epoch?: U64;
    // The minimum slot that the request can be evaluated at
    minContextSlot?: Slot;
}>;

type InflationReward = Readonly<{
    // Reward amount in lamports
    amount: Lamports;
    // Vote account commission when the reward was credited
    commission: number;
    // The slot in which the rewards are effective
    effectiveSlot: Slot;
    // Epoch for which reward occurred
    epoch: U64;
    // Post balance of the account in lamports
    postBalance: Lamports;
}>;

type GetInflationRewardApiResponse = readonly (InflationReward | null)[];

export type GetInflationRewardApi = {
    /**
     * Returns the current block height of the node
     */
    getInflationReward(addresses: Address[], config?: GetInflationRewardApiConfig): GetInflationRewardApiResponse;
};
