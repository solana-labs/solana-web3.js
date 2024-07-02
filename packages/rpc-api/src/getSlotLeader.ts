import type { Address } from '@solana/addresses';
import type { RpcApiMethods } from '@solana/rpc-spec';
import type { Commitment, Slot } from '@solana/rpc-types';

type GetSlotLeaderApiResponse = Address;

export interface GetSlotLeaderApi extends RpcApiMethods {
    /**
     * Returns the current slot leader
     */
    getSlotLeader(
        config?: Readonly<{
            commitment?: Commitment;
            minContextSlot?: Slot;
        }>,
    ): GetSlotLeaderApiResponse;
}
