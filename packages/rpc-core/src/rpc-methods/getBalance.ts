import { Base58EncodedAddress } from '@solana/keys';
import { Commitment, RpcResponse, Slot, U64UnsafeBeyond2Pow53Minus1 } from './common';

type GetBalanceApiResponse = RpcResponse<U64UnsafeBeyond2Pow53Minus1>;

export interface GetBalanceApi {
    /**
     * Returns the balance of the account of provided Pubkey
     */
    getBalance(
        address: Base58EncodedAddress,
        config?: Readonly<{
            commitment?: Commitment;
            minContextSlot?: Slot;
        }>
    ): GetBalanceApiResponse;
}
