/* eslint-disable @typescript-eslint/ban-ts-comment */

import type { Address } from '@solana/addresses';
import type { PendingRpcSubscriptionsRequest, RpcSubscriptions } from '@solana/rpc-subscriptions-spec';
import type {
    Base58EncodedBytes,
    Base58EncodedDataResponse,
    Base64EncodedDataResponse,
    Base64EncodedZStdCompressedDataResponse,
    LamportsUnsafeBeyond2Pow53Minus1,
    SolanaRpcResponse,
    U64UnsafeBeyond2Pow53Minus1,
} from '@solana/rpc-types';

import type { AccountNotificationsApi } from '../account-notifications';

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
rpcSubscriptions.accountNotifications(pubkey) satisfies PendingRpcSubscriptionsRequest<
    SolanaRpcResponse<
        TNotificationBase & {
            data: Base58EncodedBytes;
        }
    >
>;
rpcSubscriptions
    .accountNotifications(pubkey)
    .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
    AsyncIterable<
        SolanaRpcResponse<
            TNotificationBase & {
                data: Base58EncodedBytes;
            }
        >
    >
>;
// With optional configs
rpcSubscriptions.accountNotifications(pubkey, { commitment: 'confirmed' }) satisfies PendingRpcSubscriptionsRequest<
    SolanaRpcResponse<
        TNotificationBase & {
            data: Base58EncodedBytes;
        }
    >
>;
rpcSubscriptions
    .accountNotifications(pubkey, { commitment: 'confirmed' })
    .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
    AsyncIterable<
        SolanaRpcResponse<
            TNotificationBase & {
                data: Base58EncodedBytes;
            }
        >
    >
>;
// Base58 encoded data
rpcSubscriptions.accountNotifications(pubkey, { encoding: 'base58' }) satisfies PendingRpcSubscriptionsRequest<
    SolanaRpcResponse<
        TNotificationBase & {
            data: Base58EncodedDataResponse;
        }
    >
>;
rpcSubscriptions
    .accountNotifications(pubkey, { encoding: 'base58' })
    .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
    AsyncIterable<
        SolanaRpcResponse<
            TNotificationBase & {
                data: Base58EncodedDataResponse;
            }
        >
    >
>;
// Base64 encoded data
rpcSubscriptions.accountNotifications(pubkey, { encoding: 'base64' }) satisfies PendingRpcSubscriptionsRequest<
    SolanaRpcResponse<
        TNotificationBase & {
            data: Base64EncodedDataResponse;
        }
    >
>;
rpcSubscriptions
    .accountNotifications(pubkey, { encoding: 'base64' })
    .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
    AsyncIterable<
        SolanaRpcResponse<
            TNotificationBase & {
                data: Base64EncodedDataResponse;
            }
        >
    >
>;
// Base64 + ZSTD encoded data
rpcSubscriptions.accountNotifications(pubkey, { encoding: 'base64+zstd' }) satisfies PendingRpcSubscriptionsRequest<
    SolanaRpcResponse<
        TNotificationBase & {
            data: Base64EncodedZStdCompressedDataResponse;
        }
    >
>;
rpcSubscriptions
    .accountNotifications(pubkey, { encoding: 'base64+zstd' })
    .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
    AsyncIterable<
        SolanaRpcResponse<
            TNotificationBase & {
                data: Base64EncodedZStdCompressedDataResponse;
            }
        >
    >
>;
// JSON parsed data
rpcSubscriptions.accountNotifications(pubkey, { encoding: 'jsonParsed' }) satisfies PendingRpcSubscriptionsRequest<
    SolanaRpcResponse<
        TNotificationBase & {
            data:
                | Base64EncodedDataResponse
                | Readonly<{
                      parsed: unknown;
                      program: string;
                      space: U64UnsafeBeyond2Pow53Minus1;
                  }>;
        }
    >
>;
rpcSubscriptions
    .accountNotifications(pubkey, { encoding: 'jsonParsed' })
    .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
    AsyncIterable<
        SolanaRpcResponse<
            TNotificationBase & {
                data:
                    | Base64EncodedDataResponse
                    | Readonly<{
                          parsed: unknown;
                          program: string;
                          space: U64UnsafeBeyond2Pow53Minus1;
                      }>;
            }
        >
    >
>;
