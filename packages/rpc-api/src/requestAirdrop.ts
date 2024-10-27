import type { Address } from '@solana/addresses';
import type { Signature } from '@solana/keys';
import type { Commitment, Lamports } from '@solana/rpc-types';

type RequestAirdropConfig = Readonly<{
    commitment?: Commitment;
}>;

type RequestAirdropResponse = Signature;

export type RequestAirdropApi = {
    /**
     * Requests an airdrop of lamports to a Pubkey
     */
    requestAirdrop(
        recipientAccount: Address,
        lamports: Lamports,
        config?: RequestAirdropConfig,
    ): RequestAirdropResponse;
};
