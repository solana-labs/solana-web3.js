import { Address } from '@solana/addresses';
import { Signature } from '@solana/keys';
import { RequestAirdropApi } from '@solana/rpc-core';
import { Commitment, LamportsUnsafeBeyond2Pow53Minus1, Rpc } from '@solana/rpc-types';

import { createDefaultSignatureOnlyRecentTransactionConfirmer } from './airdrop-confirmer';

type RequestAndConfirmAirdropConfig = Readonly<{
    abortSignal?: AbortSignal;
    commitment: Commitment;
    confirmSignatureOnlyTransaction: ReturnType<typeof createDefaultSignatureOnlyRecentTransactionConfirmer>;
    lamports: LamportsUnsafeBeyond2Pow53Minus1;
    recipientAddress: Address;
    rpc: Rpc<RequestAirdropApi>;
}>;

export async function requestAndConfirmAirdrop_INTERNAL_ONLY_DO_NOT_EXPORT({
    abortSignal,
    commitment,
    confirmSignatureOnlyTransaction,
    lamports,
    recipientAddress,
    rpc,
}: RequestAndConfirmAirdropConfig): Promise<Signature> {
    const airdropTransactionSignature = await rpc
        .requestAirdrop(recipientAddress, lamports, { commitment })
        .send({ abortSignal });
    await confirmSignatureOnlyTransaction({
        abortSignal,
        commitment,
        signature: airdropTransactionSignature,
    });
    return airdropTransactionSignature;
}
