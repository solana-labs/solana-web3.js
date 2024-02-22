import type { RpcApiMethods } from '@solana/rpc-spec';
import type { Commitment, Slot, U64UnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';

type GetBlockHeightApiResponse = U64UnsafeBeyond2Pow53Minus1;

export interface GetBlockHeightApi extends RpcApiMethods {
    /**
     * Returns the current block height of the node
     */
    getBlockHeight(
        config?: Readonly<{
            // Defaults to `finalized`
            commitment?: Commitment;
            // The minimum slot that the request can be evaluated at
            minContextSlot?: Slot;
        }>,
    ): GetBlockHeightApiResponse;
}
