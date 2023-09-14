import { Base58EncodedAddress } from '@solana/addresses';

import { LamportsUnsafeBeyond2Pow53Minus1 } from '../lamports';
import { Base58EncodedTransactionSignature, Commitment } from './common';

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
