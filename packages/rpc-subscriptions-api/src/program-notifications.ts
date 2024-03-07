import type { Address } from '@solana/addresses';
import type { RpcSubscriptionsApiMethods } from '@solana/rpc-subscriptions-spec';
import type {
    AccountInfoBase,
    AccountInfoWithBase58Bytes,
    AccountInfoWithBase58EncodedData,
    AccountInfoWithBase64EncodedData,
    AccountInfoWithBase64EncodedZStdCompressedData,
    AccountInfoWithJsonData,
    Base58EncodedBytes,
    Base64EncodedBytes,
    Commitment,
    SolanaRpcResponse,
    U64UnsafeBeyond2Pow53Minus1,
} from '@solana/rpc-types';

type ProgramNotificationsMemcmpFilterBase58 = Readonly<{
    bytes: Base58EncodedBytes;
    encoding: 'base58';
    offset: U64UnsafeBeyond2Pow53Minus1;
}>;

type ProgramNotificationsMemcmpFilterBase64 = Readonly<{
    bytes: Base64EncodedBytes;
    encoding: 'base64';
    offset: U64UnsafeBeyond2Pow53Minus1;
}>;

type ProgramNotificationsDatasizeFilter = Readonly<{
    dataSize: U64UnsafeBeyond2Pow53Minus1;
}>;

type ProgramNotificationsApiNotificationBase<TData> = SolanaRpcResponse<
    Readonly<{
        account: AccountInfoBase & TData;
        pubkey: Address;
    }>
>;

type ProgramNotificationsApiCommonConfig = Readonly<{
    commitment?: Commitment;
    // The resultant account must meet ALL filter criteria to be included in the returned results
    filters?: readonly (
        | ProgramNotificationsDatasizeFilter
        | ProgramNotificationsMemcmpFilterBase58
        | ProgramNotificationsMemcmpFilterBase64
    )[];
}>;

export interface ProgramNotificationsApi extends RpcSubscriptionsApiMethods {
    /**
     * Subscribe to a program to receive notifications when the lamports or data for an account
     * owned by the given program changes
     */
    programNotifications(
        programId: Address,
        config: ProgramNotificationsApiCommonConfig &
            Readonly<{
                encoding: 'base64';
            }>,
    ): ProgramNotificationsApiNotificationBase<AccountInfoWithBase64EncodedData>;
    programNotifications(
        programId: Address,
        config: ProgramNotificationsApiCommonConfig &
            Readonly<{
                encoding: 'base64+zstd';
            }>,
    ): ProgramNotificationsApiNotificationBase<AccountInfoWithBase64EncodedZStdCompressedData>;
    programNotifications(
        programId: Address,
        config: ProgramNotificationsApiCommonConfig &
            Readonly<{
                encoding: 'jsonParsed';
            }>,
    ): ProgramNotificationsApiNotificationBase<AccountInfoWithJsonData>;
    programNotifications(
        programId: Address,
        config: ProgramNotificationsApiCommonConfig &
            Readonly<{
                encoding: 'base58';
            }>,
    ): ProgramNotificationsApiNotificationBase<AccountInfoWithBase58EncodedData>;
    programNotifications(
        programId: Address,
        config?: ProgramNotificationsApiCommonConfig,
    ): ProgramNotificationsApiNotificationBase<AccountInfoWithBase58Bytes>;
}
