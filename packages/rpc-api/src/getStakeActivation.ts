import type { Address } from '@solana/addresses';
import type { RpcApiMethods } from '@solana/rpc-spec';
import type { Commitment, Slot, U64UnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';

type GetStakeActivationApiResponse = Readonly<{
    /** Stake active during the epoch */
    active: U64UnsafeBeyond2Pow53Minus1;
    /** Stake inactive during the epoch */
    inactive: U64UnsafeBeyond2Pow53Minus1;
    /** The stake account's activation state */
    state: 'activating' | 'active' | 'deactivating' | 'inactive';
}>;

export interface GetStakeActivationApi extends RpcApiMethods {
    /**
     * Returns epoch activation information for a stake account
     */
    getStakeActivation(
        address: Address,
        config?: Readonly<{
            commitment?: Commitment;
            /** Defaults to current epoch */
            epoch?: U64UnsafeBeyond2Pow53Minus1;
            minContextSlot?: Slot;
        }>,
    ): GetStakeActivationApiResponse;
}
