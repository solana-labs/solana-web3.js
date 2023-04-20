import { Base58EncodedAddress } from '@solana/keys';
import { Commitment, Lamports, RpcResponse, Slot } from './common';

type GetBalanceApiResponse = RpcResponse<Lamports>;

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
