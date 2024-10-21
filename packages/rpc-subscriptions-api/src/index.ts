import {
    createRpcSubscriptionsApi,
    executeRpcPubSubSubscriptionPlan,
    RpcSubscriptionsApi,
    RpcSubscriptionsApiMethods,
} from '@solana/rpc-subscriptions-spec';
import {
    AllowedNumericKeypaths,
    getDefaultRequestTransformerForSolanaRpc,
    getDefaultResponseTransformerForSolanaRpcSubscriptions,
    jsonParsedAccountsConfigs,
    KEYPATH_WILDCARD,
    RequestTransformerConfig,
} from '@solana/rpc-transformers';

import { AccountNotificationsApi } from './account-notifications';
import { BlockNotificationsApi } from './block-notifications';
import { LogsNotificationsApi } from './logs-notifications';
import { ProgramNotificationsApi } from './program-notifications';
import { RootNotificationsApi } from './root-notifications';
import { SignatureNotificationsApi } from './signature-notifications';
import { SlotNotificationsApi } from './slot-notifications';
import { SlotsUpdatesNotificationsApi } from './slots-updates-notifications';
import { VoteNotificationsApi } from './vote-notifications';

export type SolanaRpcSubscriptionsApi = AccountNotificationsApi &
    LogsNotificationsApi &
    ProgramNotificationsApi &
    RootNotificationsApi &
    SignatureNotificationsApi &
    SlotNotificationsApi;
export type SolanaRpcSubscriptionsApiUnstable = BlockNotificationsApi &
    SlotsUpdatesNotificationsApi &
    VoteNotificationsApi;

export type {
    AccountNotificationsApi,
    BlockNotificationsApi,
    LogsNotificationsApi,
    ProgramNotificationsApi,
    RootNotificationsApi,
    SignatureNotificationsApi,
    SlotNotificationsApi,
    SlotsUpdatesNotificationsApi,
    VoteNotificationsApi,
};

type Config = RequestTransformerConfig;

function createSolanaRpcSubscriptionsApi_INTERNAL<TApi extends RpcSubscriptionsApiMethods>(
    config?: Config,
): RpcSubscriptionsApi<TApi> {
    const requestTransformer = getDefaultRequestTransformerForSolanaRpc(config);
    const responseTransformer = getDefaultResponseTransformerForSolanaRpcSubscriptions({
        allowedNumericKeyPaths: getAllowedNumericKeypaths(),
    });
    return createRpcSubscriptionsApi<TApi>({
        planExecutor({ request, ...rest }) {
            return executeRpcPubSubSubscriptionPlan({
                ...rest,
                responseTransformer,
                subscribeRequest: { ...request, methodName: request.methodName.replace(/Notifications$/, 'Subscribe') },
                unsubscribeMethodName: request.methodName.replace(/Notifications$/, 'Unsubscribe'),
            });
        },
        requestTransformer,
    });
}

export function createSolanaRpcSubscriptionsApi<TApi extends RpcSubscriptionsApiMethods = SolanaRpcSubscriptionsApi>(
    config?: Config,
): RpcSubscriptionsApi<TApi> {
    return createSolanaRpcSubscriptionsApi_INTERNAL<TApi>(config);
}

export function createSolanaRpcSubscriptionsApi_UNSTABLE(config?: Config) {
    return createSolanaRpcSubscriptionsApi_INTERNAL<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>(
        config,
    );
}

let memoizedKeypaths: AllowedNumericKeypaths<
    RpcSubscriptionsApi<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>
>;

/**
 * These are keypaths at the end of which you will find a numeric value that should *not* be upcast
 * to a `bigint`. These are values that are legitimately defined as `u8` or `usize` on the backend.
 */
function getAllowedNumericKeypaths(): AllowedNumericKeypaths<
    RpcSubscriptionsApi<SolanaRpcSubscriptionsApi & SolanaRpcSubscriptionsApiUnstable>
> {
    if (!memoizedKeypaths) {
        memoizedKeypaths = {
            accountNotifications: jsonParsedAccountsConfigs.map(c => ['value', ...c]),
            blockNotifications: [
                [
                    'value',
                    'block',
                    'transactions',
                    KEYPATH_WILDCARD,
                    'meta',
                    'preTokenBalances',
                    KEYPATH_WILDCARD,
                    'accountIndex',
                ],
                [
                    'value',
                    'block',
                    'transactions',
                    KEYPATH_WILDCARD,
                    'meta',
                    'preTokenBalances',
                    KEYPATH_WILDCARD,
                    'uiTokenAmount',
                    'decimals',
                ],
                [
                    'value',
                    'block',
                    'transactions',
                    KEYPATH_WILDCARD,
                    'meta',
                    'postTokenBalances',
                    KEYPATH_WILDCARD,
                    'accountIndex',
                ],
                [
                    'value',
                    'block',
                    'transactions',
                    KEYPATH_WILDCARD,
                    'meta',
                    'postTokenBalances',
                    KEYPATH_WILDCARD,
                    'uiTokenAmount',
                    'decimals',
                ],
                ['value', 'block', 'transactions', KEYPATH_WILDCARD, 'meta', 'rewards', KEYPATH_WILDCARD, 'commission'],
                [
                    'value',
                    'block',
                    'transactions',
                    KEYPATH_WILDCARD,
                    'meta',
                    'innerInstructions',
                    KEYPATH_WILDCARD,
                    'index',
                ],
                [
                    'value',
                    'block',
                    'transactions',
                    KEYPATH_WILDCARD,
                    'meta',
                    'innerInstructions',
                    KEYPATH_WILDCARD,
                    'instructions',
                    KEYPATH_WILDCARD,
                    'programIdIndex',
                ],
                [
                    'value',
                    'block',
                    'transactions',
                    KEYPATH_WILDCARD,
                    'meta',
                    'innerInstructions',
                    KEYPATH_WILDCARD,
                    'instructions',
                    KEYPATH_WILDCARD,
                    'accounts',
                    KEYPATH_WILDCARD,
                ],
                [
                    'value',
                    'block',
                    'transactions',
                    KEYPATH_WILDCARD,
                    'transaction',
                    'message',
                    'addressTableLookups',
                    KEYPATH_WILDCARD,
                    'writableIndexes',
                    KEYPATH_WILDCARD,
                ],
                [
                    'value',
                    'block',
                    'transactions',
                    KEYPATH_WILDCARD,
                    'transaction',
                    'message',
                    'addressTableLookups',
                    KEYPATH_WILDCARD,
                    'readonlyIndexes',
                    KEYPATH_WILDCARD,
                ],
                [
                    'value',
                    'block',
                    'transactions',
                    KEYPATH_WILDCARD,
                    'transaction',
                    'message',
                    'instructions',
                    KEYPATH_WILDCARD,
                    'programIdIndex',
                ],
                [
                    'value',
                    'block',
                    'transactions',
                    KEYPATH_WILDCARD,
                    'transaction',
                    'message',
                    'instructions',
                    KEYPATH_WILDCARD,
                    'accounts',
                    KEYPATH_WILDCARD,
                ],
                [
                    'value',
                    'block',
                    'transactions',
                    KEYPATH_WILDCARD,
                    'transaction',
                    'message',
                    'header',
                    'numReadonlySignedAccounts',
                ],
                [
                    'value',
                    'block',
                    'transactions',
                    KEYPATH_WILDCARD,
                    'transaction',
                    'message',
                    'header',
                    'numReadonlyUnsignedAccounts',
                ],
                [
                    'value',
                    'block',
                    'transactions',
                    KEYPATH_WILDCARD,
                    'transaction',
                    'message',
                    'header',
                    'numRequiredSignatures',
                ],
                ['value', 'block', 'rewards', KEYPATH_WILDCARD, 'commission'],
            ],
            programNotifications: jsonParsedAccountsConfigs.flatMap(c => [
                ['value', KEYPATH_WILDCARD, 'account', ...c],
                [KEYPATH_WILDCARD, 'account', ...c],
            ]),
        };
    }
    return memoizedKeypaths;
}
