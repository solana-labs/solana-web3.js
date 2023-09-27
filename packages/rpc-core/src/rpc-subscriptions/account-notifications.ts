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
} from '../rpc-methods/common';

type AccountNotificationsApiCommonConfig = Readonly<{
    commitment?: Commitment;
}>;

export interface AccountNotificationsApi {
    /**
     * Subscribe to an account to receive notifications when the lamports or data for
     * a given account public key changes.
     *
     * The notification format is the same as seen in the `getAccountInfo` RPC HTTP method.
     * @see https://docs.solana.com/api/websocket#getAccountInfo
     */
    accountNotifications(
        address: Base58EncodedAddress,
        config: AccountNotificationsApiCommonConfig &
            Readonly<{
                encoding: 'base64';
            }>
    ): RpcResponse<AccountInfoBase & AccountInfoWithBase64EncodedData>;
    accountNotifications(
        address: Base58EncodedAddress,
        config: AccountNotificationsApiCommonConfig &
            Readonly<{
                encoding: 'base64+zstd';
            }>
    ): RpcResponse<AccountInfoBase & AccountInfoWithBase64EncodedZStdCompressedData>;
    accountNotifications(
        address: Base58EncodedAddress,
        config: AccountNotificationsApiCommonConfig &
            Readonly<{
                encoding: 'jsonParsed';
            }>
    ): RpcResponse<AccountInfoBase & AccountInfoWithJsonData>;
    accountNotifications(
        address: Base58EncodedAddress,
        config: AccountNotificationsApiCommonConfig &
            Readonly<{
                encoding: 'base58';
            }>
    ): RpcResponse<AccountInfoBase & AccountInfoWithBase58EncodedData>;
    accountNotifications(
        address: Base58EncodedAddress,
        config?: AccountNotificationsApiCommonConfig
    ): RpcResponse<AccountInfoBase & AccountInfoWithBase58Bytes>;
}
