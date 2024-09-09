import type { Address } from '@solana/addresses';
import type { Commitment, LamportsUnsafeBeyond2Pow53Minus1, Slot, SolanaRpcResponse } from '@solana/rpc-types';

type GetBalanceApiResponse = SolanaRpcResponse<LamportsUnsafeBeyond2Pow53Minus1>;

export type GetBalanceApi = {
    /**
     * Returns the balance of the account of provided Pubkey
     */
    getBalance(
        address: Address,
        config?: Readonly<{
            commitment?: Commitment;
            minContextSlot?: Slot;
        }>,
    ): GetBalanceApiResponse;
};
