/* eslint-disable @typescript-eslint/ban-ts-comment */

import type { Address } from '@solana/addresses';
import type { Signature } from '@solana/keys';
import type { PendingRpcSubscriptionsRequest, RpcSubscriptions } from '@solana/rpc-subscriptions-spec';
import type { SolanaRpcResponse, TransactionError } from '@solana/rpc-types';

import type { LogsNotificationsApi } from '../logs-notifications';

const rpcSubscriptions = null as unknown as RpcSubscriptions<LogsNotificationsApi>;

type TNotification = SolanaRpcResponse<
    Readonly<{
        err: TransactionError | null;
        logs: readonly string[] | null;
        signature: Signature;
    }>
>;
rpcSubscriptions.logsNotifications('all') satisfies PendingRpcSubscriptionsRequest<TNotification>;
rpcSubscriptions.logsNotifications('all').subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
    AsyncIterable<TNotification>
>;
rpcSubscriptions.logsNotifications('all', {
    commitment: 'confirmed',
}) satisfies PendingRpcSubscriptionsRequest<TNotification>;
rpcSubscriptions
    .logsNotifications('all', { commitment: 'confirmed' })
    .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<AsyncIterable<TNotification>>;

rpcSubscriptions.logsNotifications('allWithVotes') satisfies PendingRpcSubscriptionsRequest<TNotification>;
rpcSubscriptions
    .logsNotifications('allWithVotes')
    .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<AsyncIterable<TNotification>>;
rpcSubscriptions.logsNotifications('allWithVotes', {
    commitment: 'confirmed',
}) satisfies PendingRpcSubscriptionsRequest<TNotification>;
rpcSubscriptions
    .logsNotifications('allWithVotes', { commitment: 'confirmed' })
    .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<AsyncIterable<TNotification>>;

rpcSubscriptions.logsNotifications({
    mentions: ['11111111111111111111111111111111' as Address],
}) satisfies PendingRpcSubscriptionsRequest<TNotification>;
rpcSubscriptions
    .logsNotifications({ mentions: ['11111111111111111111111111111111' as Address] })
    .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<AsyncIterable<TNotification>>;
rpcSubscriptions.logsNotifications(
    { mentions: ['11111111111111111111111111111111' as Address] },
    { commitment: 'confirmed' },
) satisfies PendingRpcSubscriptionsRequest<TNotification>;
rpcSubscriptions
    .logsNotifications({ mentions: ['11111111111111111111111111111111' as Address] }, { commitment: 'confirmed' })
    .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<AsyncIterable<TNotification>>;
