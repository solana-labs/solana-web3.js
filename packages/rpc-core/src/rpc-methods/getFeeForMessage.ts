import { Base64EncodedBytes, Commitment, RpcResponse, Slot, U64UnsafeBeyond2Pow53Minus1 } from './common';

/** Fee corresponding to the message at the specified blockhash */
type GetFeeForMessageApiResponse = RpcResponse<U64UnsafeBeyond2Pow53Minus1 | null>;

export interface GetFeeForMessageApi {
    /**
     * Returns the fee the network will charge for a particular Message
     */
    getFeeForMessage(
        /** Base-64 encoded message */
        message: Base64EncodedBytes,
        config?: Readonly<{
            commitment?: Commitment;
            minContextSlot?: Slot;
        }>
    ): GetFeeForMessageApiResponse;
}
