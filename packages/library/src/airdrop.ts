import { Signature } from '@solana/keys';
import type { GetSignatureStatusesApi, RequestAirdropApi, SignatureNotificationsApi } from '@solana/rpc-core';
import type { Rpc, RpcSubscriptions } from '@solana/rpc-types';

import { createDefaultSignatureOnlyRecentTransactionConfirmer } from './airdrop-confirmer';
import { requestAndConfirmAirdrop_INTERNAL_ONLY_DO_NOT_EXPORT } from './airdrop-internal';

type AirdropFunction = (
    config: Omit<
        Parameters<typeof requestAndConfirmAirdrop_INTERNAL_ONLY_DO_NOT_EXPORT>[0],
        'confirmSignatureOnlyTransaction' | 'rpc'
    >,
) => Promise<Signature>;

type AirdropFactoryConfig = Readonly<{
    rpc: Rpc<RequestAirdropApi & GetSignatureStatusesApi>;
    rpcSubscriptions: RpcSubscriptions<SignatureNotificationsApi>;
}>;

export function airdropFactory({ rpc, rpcSubscriptions }: AirdropFactoryConfig): AirdropFunction {
    const confirmSignatureOnlyTransaction = createDefaultSignatureOnlyRecentTransactionConfirmer({
        rpc,
        rpcSubscriptions,
    });
    return async function airdrop(config) {
        return await requestAndConfirmAirdrop_INTERNAL_ONLY_DO_NOT_EXPORT({
            ...config,
            confirmSignatureOnlyTransaction,
            rpc,
        });
    };
}
