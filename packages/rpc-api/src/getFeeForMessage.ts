import type { Commitment, LamportsUnsafeBeyond2Pow53Minus1, Slot, SolanaRpcResponse } from '@solana/rpc-types';
import type { TransactionMessageBytesBase64 } from '@solana/transactions';

/** Fee corresponding to the message at the specified blockhash */
type GetFeeForMessageApiResponse = LamportsUnsafeBeyond2Pow53Minus1 | null;

export type GetFeeForMessageApi = {
    /**
     * Returns the fee the network will charge for a particular Message
     */
    getFeeForMessage(
        message: TransactionMessageBytesBase64,
        config?: Readonly<{
            commitment?: Commitment;
            minContextSlot?: Slot;
        }>,
    ): SolanaRpcResponse<GetFeeForMessageApiResponse>;
};
