import { Address } from '@solana/addresses';
import { Signature } from '@solana/keys';
import type { GetSignatureStatusesApi, RequestAirdropApi, SignatureNotificationsApi } from '@solana/rpc-core';
import type { Rpc, RpcSubscriptions } from '@solana/rpc-transport';
import { Commitment, LamportsUnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';

import { createDefaultSignatureOnlyRecentTransactionConfirmer } from './airdrop-confirmer';

type AirdropRequesterConfig = Readonly<{
    rpc: Rpc<RequestAirdropApi & GetSignatureStatusesApi>;
    rpcSubscriptions: RpcSubscriptions<SignatureNotificationsApi>;
}>;

export function createDefaultAirdropRequester({ rpc, rpcSubscriptions }: AirdropRequesterConfig) {
    const confirmSignatureOnlyTransaction = createDefaultSignatureOnlyRecentTransactionConfirmer({
        rpc,
        rpcSubscriptions,
    });
    return async function requestAirdrop(
        config: Omit<Parameters<typeof requestAndConfirmAirdrop>[0], 'confirmSignatureOnlyTransaction' | 'rpc'>,
    ) {
        return await requestAndConfirmAirdrop({
            ...config,
            confirmSignatureOnlyTransaction,
            rpc,
        });
    };
}

export async function requestAndConfirmAirdrop({
    abortSignal,
    commitment,
    confirmSignatureOnlyTransaction,
    lamports,
    recipientAddress,
    rpc,
}: Readonly<{
    abortSignal?: AbortSignal;
    commitment: Commitment;
    confirmSignatureOnlyTransaction: ReturnType<typeof createDefaultSignatureOnlyRecentTransactionConfirmer>;
    lamports: LamportsUnsafeBeyond2Pow53Minus1;
    recipientAddress: Address;
    rpc: Rpc<RequestAirdropApi>;
}>): Promise<Signature> {
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
