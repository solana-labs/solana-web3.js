import type { Address } from '@solana/addresses';
import type { RpcApiMethods } from '@solana/rpc-spec';
import type {
    AccountInfoBase,
    AccountInfoWithBase58EncodedData,
    AccountInfoWithBase64EncodedData,
    AccountInfoWithBase64EncodedZStdCompressedData,
    AccountInfoWithJsonData,
    Commitment,
    DataSlice,
    Slot,
    SolanaRpcResponse,
} from '@solana/rpc-types';

type GetMultipleAccountsApiResponseBase = AccountInfoBase | null;

type GetMultipleAccountsApiCommonConfig = Readonly<{
    /** Defaults to `finalized` */
    commitment?: Commitment;
    /** The minimum slot that the request can be evaluated at */
    minContextSlot?: Slot;
}>;

type GetMultipleAccountsApiSliceableCommonConfig = Readonly<{
    /** Limit the returned account data */
    dataSlice?: DataSlice;
}>;

export interface GetMultipleAccountsApi extends RpcApiMethods {
    /**
     * Returns the account information for a list of Pubkeys.
     */
    getMultipleAccounts(
        /** An array of up to 100 Pubkeys to query */
        addresses: Address[],
        config: GetMultipleAccountsApiCommonConfig &
            GetMultipleAccountsApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base64';
            }>,
    ): SolanaRpcResponse<(GetMultipleAccountsApiResponseBase & (AccountInfoWithBase64EncodedData | null))[]>;
    getMultipleAccounts(
        /** An array of up to 100 Pubkeys to query */
        addresses: Address[],
        config: GetMultipleAccountsApiCommonConfig &
            GetMultipleAccountsApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base64+zstd';
            }>,
    ): SolanaRpcResponse<
        (GetMultipleAccountsApiResponseBase & (AccountInfoWithBase64EncodedZStdCompressedData | null))[]
    >;
    getMultipleAccounts(
        /** An array of up to 100 Pubkeys to query */
        addresses: Address[],
        config: GetMultipleAccountsApiCommonConfig &
            Readonly<{
                encoding: 'jsonParsed';
            }>,
    ): SolanaRpcResponse<(GetMultipleAccountsApiResponseBase & (AccountInfoWithJsonData | null))[]>;
    getMultipleAccounts(
        /** An array of up to 100 Pubkeys to query */
        addresses: Address[],
        config: GetMultipleAccountsApiCommonConfig &
            GetMultipleAccountsApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base58';
            }>,
    ): SolanaRpcResponse<(GetMultipleAccountsApiResponseBase & (AccountInfoWithBase58EncodedData | null))[]>;
    getMultipleAccounts(
        /** An array of up to 100 Pubkeys to query */
        addresses: Address[],
        config?: GetMultipleAccountsApiCommonConfig,
    ): SolanaRpcResponse<(GetMultipleAccountsApiResponseBase & (AccountInfoWithBase64EncodedData | null))[]>;
}
