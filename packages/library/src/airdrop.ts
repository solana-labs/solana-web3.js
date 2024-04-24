import type { Signature } from '@solana/keys';
import type { GetSignatureStatusesApi, RequestAirdropApi, Rpc } from '@solana/rpc';
import type { RpcSubscriptions, SignatureNotificationsApi } from '@solana/rpc-subscriptions';
import {
    createRecentSignatureConfirmationPromiseFactory,
    getTimeoutPromise,
    waitForRecentTransactionConfirmationUntilTimeout,
} from '@solana/transaction-confirmation';

import { requestAndConfirmAirdrop_INTERNAL_ONLY_DO_NOT_EXPORT } from './airdrop-internal';

type AirdropFunction = (
    config: Omit<
        Parameters<typeof requestAndConfirmAirdrop_INTERNAL_ONLY_DO_NOT_EXPORT>[0],
        'confirmSignatureOnlyTransaction' | 'rpc'
    >,
) => Promise<Signature>;

type AirdropFactoryConfig<TCluster> = {
    rpc: Rpc<GetSignatureStatusesApi & RequestAirdropApi> & { '~cluster'?: TCluster };
    rpcSubscriptions: RpcSubscriptions<SignatureNotificationsApi> & { '~cluster'?: TCluster };
};

export function airdropFactory({ rpc, rpcSubscriptions }: AirdropFactoryConfig<'devnet'>): AirdropFunction;
export function airdropFactory({ rpc, rpcSubscriptions }: AirdropFactoryConfig<'mainnet'>): AirdropFunction;
export function airdropFactory({ rpc, rpcSubscriptions }: AirdropFactoryConfig<'testnet'>): AirdropFunction;
export function airdropFactory<TCluster extends 'devnet' | 'mainnet' | 'testnet' | void = void>({
    rpc,
    rpcSubscriptions,
}: AirdropFactoryConfig<TCluster>): AirdropFunction {
    const getRecentSignatureConfirmationPromise = createRecentSignatureConfirmationPromiseFactory({
        rpc,
        rpcSubscriptions,
    } as Parameters<typeof createRecentSignatureConfirmationPromiseFactory>[0]);
    async function confirmSignatureOnlyTransaction(
        config: Omit<
            Parameters<typeof waitForRecentTransactionConfirmationUntilTimeout>[0],
            'getRecentSignatureConfirmationPromise' | 'getTimeoutPromise'
        >,
    ) {
        await waitForRecentTransactionConfirmationUntilTimeout({
            ...config,
            getRecentSignatureConfirmationPromise,
            getTimeoutPromise,
        });
    }
    return async function airdrop(config) {
        return await requestAndConfirmAirdrop_INTERNAL_ONLY_DO_NOT_EXPORT({
            ...config,
            confirmSignatureOnlyTransaction,
            rpc,
        });
    };
}
