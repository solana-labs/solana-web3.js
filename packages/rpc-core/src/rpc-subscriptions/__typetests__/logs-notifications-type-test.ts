/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Address } from '@solana/addresses';
import { Signature } from '@solana/keys';
import { PendingRpcSubscription, RpcSubscriptions } from '@solana/rpc-transport/dist/types/json-rpc-types';

import { RpcResponse } from '../../rpc-methods/common';
import { TransactionError } from '../../transaction-error';
import { LogsNotificationsApi } from '../logs-notifications';

async () => {
    const rpcSubscriptions = null as unknown as RpcSubscriptions<LogsNotificationsApi>;

    type TNotification = RpcResponse<
        Readonly<{
            err: TransactionError | null;
            logs: readonly string[] | null;
            signature: Signature;
        }>
    >;
    rpcSubscriptions.logsNotifications('all') satisfies PendingRpcSubscription<TNotification>;
    rpcSubscriptions
        .logsNotifications('all')
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<AsyncIterable<TNotification>>;
    rpcSubscriptions.logsNotifications('all', {
        commitment: 'confirmed',
    }) satisfies PendingRpcSubscription<TNotification>;
    rpcSubscriptions
        .logsNotifications('all', { commitment: 'confirmed' })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<AsyncIterable<TNotification>>;

    rpcSubscriptions.logsNotifications('allWithVotes') satisfies PendingRpcSubscription<TNotification>;
    rpcSubscriptions
        .logsNotifications('allWithVotes')
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<AsyncIterable<TNotification>>;
    rpcSubscriptions.logsNotifications('allWithVotes', {
        commitment: 'confirmed',
    }) satisfies PendingRpcSubscription<TNotification>;
    rpcSubscriptions
        .logsNotifications('allWithVotes', { commitment: 'confirmed' })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<AsyncIterable<TNotification>>;

    rpcSubscriptions.logsNotifications({
        mentions: ['11111111111111111111111111111111' as Address],
    }) satisfies PendingRpcSubscription<TNotification>;
    rpcSubscriptions
        .logsNotifications({ mentions: ['11111111111111111111111111111111' as Address] })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<AsyncIterable<TNotification>>;
    rpcSubscriptions.logsNotifications(
        { mentions: ['11111111111111111111111111111111' as Address] },
        { commitment: 'confirmed' }
    ) satisfies PendingRpcSubscription<TNotification>;
    rpcSubscriptions
        .logsNotifications({ mentions: ['11111111111111111111111111111111' as Address] }, { commitment: 'confirmed' })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<AsyncIterable<TNotification>>;
};
