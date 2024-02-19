import type { Address } from '@solana/addresses';
import type { RpcApiMethods } from '@solana/rpc-spec';
import type {
    Commitment,
    LamportsUnsafeBeyond2Pow53Minus1,
    Slot,
    U64UnsafeBeyond2Pow53Minus1,
} from '@solana/rpc-types';

type GetInflationRewardApiResponse = Readonly<{
    // Reward amount in lamports
    amount: LamportsUnsafeBeyond2Pow53Minus1;
    // Vote account commission when the reward was credited
    commission: number;
    // The slot in which the rewards are effective
    effectiveSlot: Slot;
    // Epoch for which reward occurred
    epoch: U64UnsafeBeyond2Pow53Minus1;
    // Post balance of the account in lamports
    postBalance: LamportsUnsafeBeyond2Pow53Minus1;
}>;

export interface GetInflationRewardApi extends RpcApiMethods {
    /**
     * Returns the current block height of the node
     */
    getInflationReward(
        addresses: Address[],
        config?: Readonly<{
            // Defaults to `finalized`
            commitment?: Commitment;
            // An epoch for which the reward occurs.
            // If omitted, the previous epoch will be used
            epoch?: U64UnsafeBeyond2Pow53Minus1;
            // The minimum slot that the request can be evaluated at
            minContextSlot?: Slot;
        }>,
    ): Promise<readonly (GetInflationRewardApiResponse | null)[]>;
}
