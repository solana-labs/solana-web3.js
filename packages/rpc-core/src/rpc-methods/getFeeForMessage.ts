import { Commitment } from '@solana/rpc-types';
import { SerializedMessageBytesBase64 } from '@solana/transactions';

import { RpcResponse, Slot, U64UnsafeBeyond2Pow53Minus1 } from './common';

/** Fee corresponding to the message at the specified blockhash */
type GetFeeForMessageApiResponse = RpcResponse<U64UnsafeBeyond2Pow53Minus1 | null>;

export interface GetFeeForMessageApi {
    /**
     * Returns the fee the network will charge for a particular Message
     */
    getFeeForMessage(
        message: SerializedMessageBytesBase64,
        config?: Readonly<{
            commitment?: Commitment;
            minContextSlot?: Slot;
        }>
    ): GetFeeForMessageApiResponse;
}
