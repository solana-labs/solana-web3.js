import { Base58EncodedAddress } from '@solana/keys';
import { Commitment, Slot, U64UnsafeBeyond2Pow53Minus1 } from './common';

type GetBalanceApiResponse = Readonly<{
    context: Readonly<{
        slot: Slot;
    }>;
    value: U64UnsafeBeyond2Pow53Minus1;
}>;

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
