import { Base58EncodedAddress } from '@solana/addresses';

import {
    AccountInfoBase,
    AccountInfoWithBase58Bytes,
    AccountInfoWithBase58EncodedData,
    AccountInfoWithBase64EncodedData,
    AccountInfoWithBase64EncodedZStdCompressedData,
    AccountInfoWithJsonData,
    Commitment,
    RpcResponse,
    U64UnsafeBeyond2Pow53Minus1,
} from '../rpc-methods/common';

type ProgramNotificationsMemcmpFilter = Readonly<{
    offset: U64UnsafeBeyond2Pow53Minus1;
    bytes: string;
    encoding: 'base58' | 'base64';
}>;

type ProgramNotificationsDatasizeFilter = Readonly<{
    dataSize: U64UnsafeBeyond2Pow53Minus1;
}>;

type ProgramNotificationsApiNotificationBase<TData> = RpcResponse<
    Readonly<{
        pubkey: Base58EncodedAddress;
        account: AccountInfoBase & TData;
    }>
>;

type ProgramNotificationsApiCommonConfig = Readonly<{
    commitment?: Commitment;
    // The resultant account must meet ALL filter criteria to be included in the returned results
    filters?: readonly (ProgramNotificationsMemcmpFilter | ProgramNotificationsDatasizeFilter)[];
}>;

export interface ProgramNotificationsApi {
    /**
     * Subscribe to a program to receive notifications when the lamports or data for an account
     * owned by the given program changes
     */
    programNotifications(
        programId: Base58EncodedAddress,
        config: ProgramNotificationsApiCommonConfig &
            Readonly<{
                encoding: 'base64';
            }>
    ): ProgramNotificationsApiNotificationBase<AccountInfoWithBase64EncodedData>;
    programNotifications(
        programId: Base58EncodedAddress,
        config: ProgramNotificationsApiCommonConfig &
            Readonly<{
                encoding: 'base64+zstd';
            }>
    ): ProgramNotificationsApiNotificationBase<AccountInfoWithBase64EncodedZStdCompressedData>;
    programNotifications(
        programId: Base58EncodedAddress,
        config: ProgramNotificationsApiCommonConfig &
            Readonly<{
                encoding: 'jsonParsed';
            }>
    ): ProgramNotificationsApiNotificationBase<AccountInfoWithJsonData>;
    programNotifications(
        programId: Base58EncodedAddress,
        config: ProgramNotificationsApiCommonConfig &
            Readonly<{
                encoding: 'base58';
            }>
    ): ProgramNotificationsApiNotificationBase<AccountInfoWithBase58EncodedData>;
    programNotifications(
        programId: Base58EncodedAddress,
        config?: ProgramNotificationsApiCommonConfig
    ): ProgramNotificationsApiNotificationBase<AccountInfoWithBase58Bytes>;
}
