import { Address } from '@solana/addresses';
import type {
    Commitment,
    IRpcApiMethods,
    LamportsUnsafeBeyond2Pow53Minus1,
    RpcResponse,
    Slot,
} from '@solana/rpc-types';

type GetBalanceApiResponse = RpcResponse<LamportsUnsafeBeyond2Pow53Minus1>;

export interface GetBalanceApi extends IRpcApiMethods {
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
}
