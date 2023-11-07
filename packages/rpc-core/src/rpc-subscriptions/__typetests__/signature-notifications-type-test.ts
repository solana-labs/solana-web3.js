/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Signature } from '@solana/keys';
import { PendingRpcSubscription, RpcSubscriptions } from '@solana/rpc-transport/dist/types/json-rpc-types';

import { RpcResponse } from '../../rpc-methods/common';
import { TransactionError } from '../../transaction-error';
import { SignatureNotificationsApi } from '../signature-notifications';

async () => {
    const rpcSubscriptions = null as unknown as RpcSubscriptions<SignatureNotificationsApi>;

    type TNotificationReceived = RpcResponse<Readonly<string>>;
    type TNotificationProcessed = RpcResponse<
        Readonly<{
            err: TransactionError | null;
        }>
    >;

    rpcSubscriptions.signatureNotifications(
        'xxxxx' as Signature
    ) satisfies PendingRpcSubscription<TNotificationProcessed>;
    rpcSubscriptions
        .signatureNotifications('xxxxx' as Signature)
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<TNotificationProcessed>
    >;

    rpcSubscriptions.signatureNotifications('xxxxx' as Signature, {
        commitment: 'confirmed',
    }) satisfies PendingRpcSubscription<TNotificationProcessed>;
    rpcSubscriptions
        .signatureNotifications('xxxxx' as Signature, { commitment: 'confirmed' })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<TNotificationProcessed>
    >;

    rpcSubscriptions.signatureNotifications('xxxxx' as Signature, {
        commitment: 'confirmed',
        enableReceivedNotification: false,
    }) satisfies PendingRpcSubscription<TNotificationProcessed>;
    rpcSubscriptions
        .signatureNotifications('xxxxx' as Signature, {
            commitment: 'confirmed',
            enableReceivedNotification: false,
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<TNotificationProcessed>
    >;

    rpcSubscriptions.signatureNotifications('xxxxx' as Signature, {
        commitment: 'confirmed',
        enableReceivedNotification: true,
    }) satisfies PendingRpcSubscription<TNotificationProcessed | TNotificationReceived>;
    rpcSubscriptions
        .signatureNotifications('xxxxx' as Signature, {
            commitment: 'confirmed',
            enableReceivedNotification: true,
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<TNotificationProcessed | TNotificationReceived>
    >;
    rpcSubscriptions.signatureNotifications('xxxxx' as Signature, {
        commitment: 'confirmed',
        enableReceivedNotification: true,
        // @ts-expect-error Should have both notification types
    }) satisfies PendingRpcSubscription<TNotificationProcessed>;
    rpcSubscriptions
        .signatureNotifications('xxxxx' as Signature, {
            commitment: 'confirmed',
            enableReceivedNotification: true,
        })
        // @ts-expect-error Should have both notification types
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<TNotificationProcessed>
    >;
};
