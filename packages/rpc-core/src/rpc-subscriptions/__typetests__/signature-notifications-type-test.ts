/* eslint-disable @typescript-eslint/ban-ts-comment */

import { PendingRpcSubscription, RpcSubscriptions } from '@solana/rpc-transport/dist/types/json-rpc-types';

import { RpcResponse } from '../../rpc-methods/common';
import { TransactionError } from '../../transaction-error';
import { TransactionSignature } from '../../transaction-signature';
import { SignatureNotificationsApi } from '../signature-notifications';

async () => {
    const rpcSubscriptions = null as unknown as RpcSubscriptions<SignatureNotificationsApi>;

    type TNotification = RpcResponse<
        Readonly<{
            err: TransactionError | null;
        }>
    >;

    rpcSubscriptions.signatureNotifications(
        'xxxxx' as TransactionSignature
    ) satisfies PendingRpcSubscription<TNotification>;
    rpcSubscriptions
        .signatureNotifications('xxxxx' as TransactionSignature)
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<AsyncIterable<TNotification>>;

    rpcSubscriptions.signatureNotifications('xxxxx' as TransactionSignature, {
        commitment: 'confirmed',
    }) satisfies PendingRpcSubscription<TNotification>;
    rpcSubscriptions
        .signatureNotifications('xxxxx' as TransactionSignature, { commitment: 'confirmed' })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<AsyncIterable<TNotification>>;
};
