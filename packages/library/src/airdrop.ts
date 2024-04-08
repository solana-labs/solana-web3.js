import type { Signature } from '@solana/keys';
import type { GetSignatureStatusesApi, RequestAirdropApi, RpcDevnet, RpcTestnet } from '@solana/rpc';
import type {
    RpcSubscriptionsDevnet,
    RpcSubscriptionsTestnet,
    SignatureNotificationsApi,
} from '@solana/rpc-subscriptions';
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

type AirdropFactoryRpcApi = GetSignatureStatusesApi & RequestAirdropApi;
type AirdropFactoryRpcSubscriptionsApi = SignatureNotificationsApi;

type AirdropFactoryConfig<
    TRpc extends RpcDevnet<AirdropFactoryRpcApi> | RpcTestnet<AirdropFactoryRpcApi>,
    TRpcSubscriptions extends
        | RpcSubscriptionsDevnet<AirdropFactoryRpcSubscriptionsApi>
        | RpcSubscriptionsTestnet<AirdropFactoryRpcSubscriptionsApi>,
> = Readonly<{
    rpc: TRpc;
    rpcSubscriptions: TRpcSubscriptions;
}>;

export function airdropFactory({
    rpc,
    rpcSubscriptions,
}: AirdropFactoryConfig<
    RpcDevnet<AirdropFactoryRpcApi>,
    RpcSubscriptionsDevnet<AirdropFactoryRpcSubscriptionsApi>
>): AirdropFunction;
export function airdropFactory({
    rpc,
    rpcSubscriptions,
}: AirdropFactoryConfig<
    RpcTestnet<AirdropFactoryRpcApi>,
    RpcSubscriptionsTestnet<AirdropFactoryRpcSubscriptionsApi>
>): AirdropFunction;
export function airdropFactory({
    rpc,
    rpcSubscriptions,
}: AirdropFactoryConfig<
    RpcDevnet<AirdropFactoryRpcApi> | RpcTestnet<AirdropFactoryRpcApi>,
    | RpcSubscriptionsDevnet<AirdropFactoryRpcSubscriptionsApi>
    | RpcSubscriptionsTestnet<AirdropFactoryRpcSubscriptionsApi>
>): AirdropFunction {
    const getRecentSignatureConfirmationPromise = createRecentSignatureConfirmationPromiseFactory(
        rpc,
        rpcSubscriptions,
    );
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
