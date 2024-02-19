import type { RpcApiMethods } from '@solana/rpc-spec';
import type { Blockhash, Commitment, Slot, SolanaRpcResponse } from '@solana/rpc-types';

type IsBlockhashValidApiResponse = SolanaRpcResponse<boolean>;

export interface IsBlockhashValidApi extends RpcApiMethods {
    /**
     * Returns whether a blockhash is still valid or not
     */
    isBlockhashValid(
        /** query blockhash, as a base-58 encoded string */
        blockhash: Blockhash,
        config?: Readonly<{
            /** Defaults to `finalized` */
            commitment?: Commitment;
            /** The minimum slot that the request can be evaluated at */
            minContextSlot?: Slot;
        }>,
    ): IsBlockhashValidApiResponse;
}
