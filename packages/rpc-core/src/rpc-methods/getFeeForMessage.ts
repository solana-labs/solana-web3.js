import type { Commitment, IRpcApiMethods, RpcResponse, Slot, U64UnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';
import { SerializedMessageBytesBase64 } from '@solana/transactions';

/** Fee corresponding to the message at the specified blockhash */
type GetFeeForMessageApiResponse = RpcResponse<U64UnsafeBeyond2Pow53Minus1 | null>;

export interface GetFeeForMessageApi extends IRpcApiMethods {
    /**
     * Returns the fee the network will charge for a particular Message
     */
    getFeeForMessage(
        message: SerializedMessageBytesBase64,
        config?: Readonly<{
            commitment?: Commitment;
            minContextSlot?: Slot;
        }>,
    ): GetFeeForMessageApiResponse;
}
