import type { RpcApiMethods } from '@solana/rpc-spec';
import type { Commitment, Slot, SolanaRpcResponse, U64UnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';
import type { SerializedMessageBytesBase64 } from '@solana/transactions';

/** Fee corresponding to the message at the specified blockhash */
type GetFeeForMessageApiResponse = SolanaRpcResponse<U64UnsafeBeyond2Pow53Minus1 | null>;

export interface GetFeeForMessageApi extends RpcApiMethods {
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
