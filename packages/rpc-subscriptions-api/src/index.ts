import {
    createRpcSubscriptionsApi,
    RpcSubscriptionsApi,
    RpcSubscriptionsApiMethods,
} from '@solana/rpc-subscriptions-spec';
import {
    AllowedNumericKeypaths,
    getDefaultParamsTransformerForSolanaRpc,
    getDefaultResponseTransformerForSolanaRpc,
    jsonParsedAccountsConfigs,
    KEYPATH_WILDCARD,
    ParamsTransformerConfig,
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

type Config = ParamsTransformerConfig;

function createSolanaRpcSubscriptionsApi_INTERNAL<TApi extends RpcSubscriptionsApiMethods>(
    config?: Config,
): RpcSubscriptionsApi<TApi> {
    return createRpcSubscriptionsApi<TApi>({
        parametersTransformer: getDefaultParamsTransformerForSolanaRpc(config) as (params: unknown[]) => unknown[],
        responseTransformer: getDefaultResponseTransformerForSolanaRpc({
            allowedNumericKeyPaths: getAllowedNumericKeypaths(),
        }),
        subscribeNotificationNameTransformer: (notificationName: string) =>
            notificationName.replace(/Notifications$/, 'Subscribe'),
        unsubscribeNotificationNameTransformer: (notificationName: string) =>
            notificationName.replace(/Notifications$/, 'Unsubscribe'),
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
                ['value', 'block', 'blockTime'],
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
