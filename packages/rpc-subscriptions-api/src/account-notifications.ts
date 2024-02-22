import type { Address } from '@solana/addresses';
import type { RpcSubscriptionsApiMethods } from '@solana/rpc-subscriptions-spec';
import type {
    AccountInfoBase,
    AccountInfoWithBase58Bytes,
    AccountInfoWithBase58EncodedData,
    AccountInfoWithBase64EncodedData,
    AccountInfoWithBase64EncodedZStdCompressedData,
    AccountInfoWithJsonData,
    Commitment,
    SolanaRpcResponse,
} from '@solana/rpc-types';

type AccountNotificationsApiCommonConfig = Readonly<{
    commitment?: Commitment;
}>;

export interface AccountNotificationsApi extends RpcSubscriptionsApiMethods {
    /**
     * Subscribe to an account to receive notifications when the lamports or data for
     * a given account public key changes.
     *
     * The notification format is the same as seen in the `getAccountInfo` RPC HTTP method.
     * @see https://docs.solana.com/api/websocket#getAccountInfo
     */
    accountNotifications(
        address: Address,
        config: AccountNotificationsApiCommonConfig &
            Readonly<{
                encoding: 'base64';
            }>,
    ): SolanaRpcResponse<AccountInfoBase & AccountInfoWithBase64EncodedData>;
    accountNotifications(
        address: Address,
        config: AccountNotificationsApiCommonConfig &
            Readonly<{
                encoding: 'base64+zstd';
            }>,
    ): SolanaRpcResponse<AccountInfoBase & AccountInfoWithBase64EncodedZStdCompressedData>;
    accountNotifications(
        address: Address,
        config: AccountNotificationsApiCommonConfig &
            Readonly<{
                encoding: 'jsonParsed';
            }>,
    ): SolanaRpcResponse<AccountInfoBase & AccountInfoWithJsonData>;
    accountNotifications(
        address: Address,
        config: AccountNotificationsApiCommonConfig &
            Readonly<{
                encoding: 'base58';
            }>,
    ): SolanaRpcResponse<AccountInfoBase & AccountInfoWithBase58EncodedData>;
    accountNotifications(
        address: Address,
        config?: AccountNotificationsApiCommonConfig,
    ): SolanaRpcResponse<AccountInfoBase & AccountInfoWithBase58Bytes>;
}
