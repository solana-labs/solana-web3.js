/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Address } from '@solana/addresses';
import { PendingRpcSubscription, RpcSubscriptions } from '@solana/rpc-transport/dist/types/json-rpc-types';
import { LamportsUnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';

import {
    Base58EncodedBytes,
    Base58EncodedDataResponse,
    Base64EncodedDataResponse,
    Base64EncodedZStdCompressedDataResponse,
    RpcResponse,
    U64UnsafeBeyond2Pow53Minus1,
} from '../../rpc-methods/common';
import { AccountNotificationsApi } from '../account-notifications';

async () => {
    const rpcSubscriptions = null as unknown as RpcSubscriptions<AccountNotificationsApi>;
    // See scripts/fixtures/GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G.json
    // data is 'test data'
    // Note: In type tests, it doesn't matter if the account is actually JSON-parseable
    const pubkey =
        'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Address<'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G'>;

    type TNotificationBase = Readonly<{
        executable: boolean;
        lamports: LamportsUnsafeBeyond2Pow53Minus1;
        owner: Address;
        rentEpoch: U64UnsafeBeyond2Pow53Minus1;
    }>;

    // No optional configs
    rpcSubscriptions.accountNotifications(pubkey) satisfies PendingRpcSubscription<
        RpcResponse<
            TNotificationBase & {
                data: Base58EncodedBytes;
            }
        >
    >;
    rpcSubscriptions
        .accountNotifications(pubkey)
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            RpcResponse<
                TNotificationBase & {
                    data: Base58EncodedBytes;
                }
            >
        >
    >;
    // With optional configs
    rpcSubscriptions.accountNotifications(pubkey, { commitment: 'confirmed' }) satisfies PendingRpcSubscription<
        RpcResponse<
            TNotificationBase & {
                data: Base58EncodedBytes;
            }
        >
    >;
    rpcSubscriptions
        .accountNotifications(pubkey, { commitment: 'confirmed' })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            RpcResponse<
                TNotificationBase & {
                    data: Base58EncodedBytes;
                }
            >
        >
    >;
    // Base58 encoded data
    rpcSubscriptions.accountNotifications(pubkey, { encoding: 'base58' }) satisfies PendingRpcSubscription<
        RpcResponse<
            TNotificationBase & {
                data: Base58EncodedDataResponse;
            }
        >
    >;
    rpcSubscriptions
        .accountNotifications(pubkey, { encoding: 'base58' })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            RpcResponse<
                TNotificationBase & {
                    data: Base58EncodedDataResponse;
                }
            >
        >
    >;
    // Base64 encoded data
    rpcSubscriptions.accountNotifications(pubkey, { encoding: 'base64' }) satisfies PendingRpcSubscription<
        RpcResponse<
            TNotificationBase & {
                data: Base64EncodedDataResponse;
            }
        >
    >;
    rpcSubscriptions
        .accountNotifications(pubkey, { encoding: 'base64' })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            RpcResponse<
                TNotificationBase & {
                    data: Base64EncodedDataResponse;
                }
            >
        >
    >;
    // Base64 + ZSTD encoded data
    rpcSubscriptions.accountNotifications(pubkey, { encoding: 'base64+zstd' }) satisfies PendingRpcSubscription<
        RpcResponse<
            TNotificationBase & {
                data: Base64EncodedZStdCompressedDataResponse;
            }
        >
    >;
    rpcSubscriptions
        .accountNotifications(pubkey, { encoding: 'base64+zstd' })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            RpcResponse<
                TNotificationBase & {
                    data: Base64EncodedZStdCompressedDataResponse;
                }
            >
        >
    >;
    // JSON parsed data
    rpcSubscriptions.accountNotifications(pubkey, { encoding: 'jsonParsed' }) satisfies PendingRpcSubscription<
        RpcResponse<
            TNotificationBase & {
                data:
                    | Readonly<{
                          program: string;
                          parsed: unknown;
                          space: U64UnsafeBeyond2Pow53Minus1;
                      }>
                    | Base64EncodedDataResponse;
            }
        >
    >;
    rpcSubscriptions
        .accountNotifications(pubkey, { encoding: 'jsonParsed' })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            RpcResponse<
                TNotificationBase & {
                    data:
                        | Readonly<{
                              program: string;
                              parsed: unknown;
                              space: U64UnsafeBeyond2Pow53Minus1;
                          }>
                        | Base64EncodedDataResponse;
                }
            >
        >
    >;
};
