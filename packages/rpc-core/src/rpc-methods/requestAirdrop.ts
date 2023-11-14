import { Address } from '@solana/addresses';
import { Signature } from '@solana/keys';
import type { IRpcApiMethods } from '@solana/rpc-transport';
import { Commitment, LamportsUnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';

type RequestAirdropConfig = Readonly<{
    commitment?: Commitment;
}>;

type RequestAirdropResponse = Signature;

export interface RequestAirdropApi extends IRpcApiMethods {
    /**
     * Requests an airdrop of lamports to a Pubkey
     */
    requestAirdrop(
        recipientAccount: Address,
        lamports: LamportsUnsafeBeyond2Pow53Minus1,
        config?: RequestAirdropConfig,
    ): RequestAirdropResponse;
}
