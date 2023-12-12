import type { IRpcApiMethods } from '@solana/rpc-transport';
import { Commitment } from '@solana/rpc-types';

import { Slot } from './common';

type GetBlocksApiResponse = Slot[];

export interface GetBlocksApi extends IRpcApiMethods {
    /**
     * Returns a list of confirmed blocks between two slots
     */
    getBlocks(
        startSlot: Slot,
        endSlotInclusive?: Slot,
        config?: Readonly<{
            // Defaults to `finalized`
            commitment?: Exclude<Commitment, 'processed'>;
        }>,
    ): GetBlocksApiResponse;
}
