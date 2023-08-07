import { Base58EncodedAddress } from '@solana/addresses';

import { Commitment, Slot, U64UnsafeBeyond2Pow53Minus1 } from './common';

type GetStakeActivationApiResponse = Readonly<{
    /** Stake active during the epoch */
    active: U64UnsafeBeyond2Pow53Minus1;
    /** Stake inactive during the epoch */
    inactive: U64UnsafeBeyond2Pow53Minus1;
    /** The stake account's activation state */
    state: 'active' | 'inactive' | 'activating' | 'deactivating';
}>;

export interface GetStakeActivationApi {
    /**
     * Returns epoch activation information for a stake account
     */
    getStakeActivation(
        address: Base58EncodedAddress,
        config?: Readonly<{
            commitment?: Commitment;
            minContextSlot?: Slot;
            /** Defaults to current epoch */
            epoch?: U64UnsafeBeyond2Pow53Minus1;
        }>
    ): GetStakeActivationApiResponse;
}
