import { Base58EncodedAddress } from '@solana/keys';

import { Base58EncodedTransactionSignature, Commitment, LamportsUnsafeBeyond2Pow53Minus1 } from './common';

type RequestAirdropConfig = Readonly<{
    commitment?: Commitment;
}>;

type RequestAirdropResponse = Base58EncodedTransactionSignature;

export interface RequestAirdropApi {
    /**
     * Requests an airdrop of lamports to a Pubkey
     */
    requestAirdrop(
        recipientAccount: Base58EncodedAddress,
        lamports: LamportsUnsafeBeyond2Pow53Minus1,
        config?: RequestAirdropConfig
    ): RequestAirdropResponse;
}
