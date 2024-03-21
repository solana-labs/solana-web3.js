/* eslint-disable @typescript-eslint/ban-ts-comment */

import type { Address } from '@solana/addresses';
import type { PendingRpcSubscriptionsRequest, RpcSubscriptions } from '@solana/rpc-subscriptions-spec';
import type {
    Base58EncodedBytes,
    Base58EncodedDataResponse,
    Base64EncodedBytes,
    Base64EncodedDataResponse,
    Base64EncodedZStdCompressedDataResponse,
    LamportsUnsafeBeyond2Pow53Minus1,
    SolanaRpcResponse,
    U64UnsafeBeyond2Pow53Minus1,
} from '@solana/rpc-types';

import type { ProgramNotificationsApi } from '../program-notifications';

const rpcSubscriptions = null as unknown as RpcSubscriptions<ProgramNotificationsApi>;
// See scripts/fixtures/GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G.json
// Note: Only using this address for type tests. It's not actually a program.
const programId =
    'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Address<'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G'>;

type TNotificationBase = Readonly<{
    account: Readonly<{
        executable: boolean;
        lamports: LamportsUnsafeBeyond2Pow53Minus1;
        owner: Address;
        rentEpoch: U64UnsafeBeyond2Pow53Minus1;
    }>;
    pubkey: Address;
}>;

// No optional configs
rpcSubscriptions.programNotifications(programId) satisfies PendingRpcSubscriptionsRequest<
    SolanaRpcResponse<
        TNotificationBase & {
            account: {
                data: Base58EncodedBytes;
            };
        }
    >
>;
rpcSubscriptions
    .programNotifications(programId)
    .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
    AsyncIterable<
        SolanaRpcResponse<
            TNotificationBase & {
                account: {
                    data: Base58EncodedBytes;
                };
            }
        >
    >
>;
// With optional configs
rpcSubscriptions.programNotifications(programId, {
    commitment: 'confirmed',
}) satisfies PendingRpcSubscriptionsRequest<
    SolanaRpcResponse<
        TNotificationBase & {
            account: {
                data: Base58EncodedBytes;
            };
        }
    >
>;
rpcSubscriptions
    .programNotifications(programId, { commitment: 'confirmed' })
    .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
    AsyncIterable<
        SolanaRpcResponse<
            TNotificationBase & {
                account: {
                    data: Base58EncodedBytes;
                };
            }
        >
    >
>;
// Base58 encoded data
rpcSubscriptions.programNotifications(programId, { encoding: 'base58' }) satisfies PendingRpcSubscriptionsRequest<
    SolanaRpcResponse<
        TNotificationBase & {
            account: {
                data: Base58EncodedDataResponse;
            };
        }
    >
>;
rpcSubscriptions
    .programNotifications(programId, { encoding: 'base58' })
    .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
    AsyncIterable<
        SolanaRpcResponse<
            TNotificationBase & {
                account: {
                    data: Base58EncodedDataResponse;
                };
            }
        >
    >
>;
// Base64 encoded data
rpcSubscriptions.programNotifications(programId, { encoding: 'base64' }) satisfies PendingRpcSubscriptionsRequest<
    SolanaRpcResponse<
        TNotificationBase & {
            account: {
                data: Base64EncodedDataResponse;
            };
        }
    >
>;
rpcSubscriptions
    .programNotifications(programId, { encoding: 'base64' })
    .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
    AsyncIterable<
        SolanaRpcResponse<
            TNotificationBase & {
                account: {
                    data: Base64EncodedDataResponse;
                };
            }
        >
    >
>;
// Base64 + ZSTD encoded data
rpcSubscriptions.programNotifications(programId, {
    encoding: 'base64+zstd',
}) satisfies PendingRpcSubscriptionsRequest<
    SolanaRpcResponse<
        TNotificationBase & {
            account: {
                data: Base64EncodedZStdCompressedDataResponse;
            };
        }
    >
>;
rpcSubscriptions
    .programNotifications(programId, { encoding: 'base64+zstd' })
    .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
    AsyncIterable<
        SolanaRpcResponse<
            TNotificationBase & {
                account: {
                    data: Base64EncodedZStdCompressedDataResponse;
                };
            }
        >
    >
>;
// JSON parsed data
rpcSubscriptions.programNotifications(programId, {
    encoding: 'jsonParsed',
}) satisfies PendingRpcSubscriptionsRequest<
    SolanaRpcResponse<
        TNotificationBase & {
            account: {
                data:
                    | Base64EncodedDataResponse
                    | Readonly<{
                          parsed: unknown;
                          program: string;
                          space: U64UnsafeBeyond2Pow53Minus1;
                      }>;
            };
        }
    >
>;
rpcSubscriptions
    .programNotifications(programId, { encoding: 'jsonParsed' })
    .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
    AsyncIterable<
        SolanaRpcResponse<
            TNotificationBase & {
                account: {
                    data:
                        | Base64EncodedDataResponse
                        | Readonly<{
                              parsed: unknown;
                              program: string;
                              space: U64UnsafeBeyond2Pow53Minus1;
                          }>;
                };
            }
        >
    >
>;

// Filters
({
    filters: [
        {
            bytes: 'bytes' as Base58EncodedBytes,
            encoding: 'base58',
            offset: 0n as U64UnsafeBeyond2Pow53Minus1,
        },
    ],
}) satisfies Parameters<RpcSubscriptions<ProgramNotificationsApi>['programNotifications']>[1];
// Can't flop them
({
    filters: [
        {
            // @ts-expect-error Can't flop them
            bytes: 'bytes' as Base58EncodedBytes,
            encoding: 'base64',
            offset: 0n as U64UnsafeBeyond2Pow53Minus1,
        },
    ],
}) satisfies Parameters<RpcSubscriptions<ProgramNotificationsApi>['programNotifications']>[1];
({
    filters: [
        {
            bytes: 'bytes' as Base64EncodedBytes,
            encoding: 'base64',
            offset: 0n as U64UnsafeBeyond2Pow53Minus1,
        },
    ],
}) satisfies Parameters<RpcSubscriptions<ProgramNotificationsApi>['programNotifications']>[1];
// Can't flop them
({
    filters: [
        {
            // @ts-expect-error Can't flop them
            bytes: 'bytes' as Base64EncodedBytes,
            encoding: 'base58',
            offset: 0n as U64UnsafeBeyond2Pow53Minus1,
        },
    ],
}) satisfies Parameters<RpcSubscriptions<ProgramNotificationsApi>['programNotifications']>[1];
