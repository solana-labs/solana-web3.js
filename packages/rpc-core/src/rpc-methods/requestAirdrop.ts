import type { Address } from '@solana/addresses';
import type { Signature } from '@solana/keys';
import type { Commitment, IRpcApiMethods, LamportsUnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';

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
