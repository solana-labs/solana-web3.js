import { Base58EncodedAddress } from '@solana/addresses';

import {
    AccountInfoBase,
    AccountInfoWithBase58EncodedData,
    AccountInfoWithBase64EncodedData,
    AccountInfoWithBase64EncodedZStdCompressedData,
    AccountInfoWithJsonData,
    Commitment,
    DataSlice,
    RpcResponse,
    Slot,
} from './common';

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

export interface GetMultipleAccountsApi {
    /**
     * Returns the account information for a list of Pubkeys.
     */
    getMultipleAccounts(
        /** An array of up to 100 Pubkeys to query */
        addresses: Base58EncodedAddress[],
        config: GetMultipleAccountsApiCommonConfig &
            GetMultipleAccountsApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base64';
            }>
    ): RpcResponse<(GetMultipleAccountsApiResponseBase & AccountInfoWithBase64EncodedData)[]>;
    getMultipleAccounts(
        /** An array of up to 100 Pubkeys to query */
        addresses: Base58EncodedAddress[],
        config: GetMultipleAccountsApiCommonConfig &
            GetMultipleAccountsApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base64+zstd';
            }>
    ): RpcResponse<(GetMultipleAccountsApiResponseBase & AccountInfoWithBase64EncodedZStdCompressedData)[]>;
    getMultipleAccounts(
        /** An array of up to 100 Pubkeys to query */
        addresses: Base58EncodedAddress[],
        config: GetMultipleAccountsApiCommonConfig &
            Readonly<{
                encoding: 'jsonParsed';
            }>
    ): RpcResponse<(GetMultipleAccountsApiResponseBase & AccountInfoWithJsonData)[]>;
    getMultipleAccounts(
        /** An array of up to 100 Pubkeys to query */
        addresses: Base58EncodedAddress[],
        config: GetMultipleAccountsApiCommonConfig &
            GetMultipleAccountsApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base58';
            }>
    ): RpcResponse<(GetMultipleAccountsApiResponseBase & AccountInfoWithBase58EncodedData)[]>;
    getMultipleAccounts(
        /** An array of up to 100 Pubkeys to query */
        addresses: Base58EncodedAddress[],
        config?: GetMultipleAccountsApiCommonConfig
    ): RpcResponse<(GetMultipleAccountsApiResponseBase & AccountInfoWithBase64EncodedData)[]>;
}
