import { Base58EncodedAddress } from '@solana/addresses';
import { Commitment, LamportsUnsafeBeyond2Pow53Minus1 } from '@solana/rpc-core';
import { GetSignatureStatusesApi } from '@solana/rpc-core/dist/types/rpc-methods/getSignatureStatuses';
import { RequestAirdropApi } from '@solana/rpc-core/dist/types/rpc-methods/requestAirdrop';
import { SignatureNotificationsApi } from '@solana/rpc-core/dist/types/rpc-subscriptions/signature-notifications';
import { Rpc, RpcSubscriptions } from '@solana/rpc-transport/dist/types/json-rpc-types';
import { TransactionSignature } from '@solana/transactions';

import { createDefaultSignatureOnlyRecentTransactionConfirmer } from './airdrop-confirmer';

type Config = Readonly<{
    abortSignal: AbortSignal;
    commitment: Commitment;
    lamports: LamportsUnsafeBeyond2Pow53Minus1;
    recipientAddress: Base58EncodedAddress;
    rpc: Rpc<RequestAirdropApi & GetSignatureStatusesApi>;
    rpcSubscriptions: RpcSubscriptions<SignatureNotificationsApi>;
}>;

export async function requestAndConfirmAirdrop({
    abortSignal,
    commitment,
    lamports,
    recipientAddress,
    rpc,
    rpcSubscriptions,
}: Config): Promise<TransactionSignature> {
    const airdropTransactionSignature = (await rpc
        .requestAirdrop(recipientAddress, lamports, { commitment })
        .send({ abortSignal })) as unknown as TransactionSignature;
    const confirmSignatureOnlyTransaction = createDefaultSignatureOnlyRecentTransactionConfirmer({
        rpc,
        rpcSubscriptions,
    });
    await confirmSignatureOnlyTransaction({
        abortSignal,
        commitment,
        signature: airdropTransactionSignature,
    });
    return airdropTransactionSignature;
}
