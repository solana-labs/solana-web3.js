import { Base58EncodedAddress } from '@solana/addresses';

import {
    Base58EncodedDataResponse,
    Base64EncodedDataResponse,
    Base64EncodedZStdCompressedDataResponse,
    Commitment,
    DataSlice,
    LamportsUnsafeBeyond2Pow53Minus1,
    RpcResponse,
    Slot,
    U64UnsafeBeyond2Pow53Minus1,
} from './common';

type GetMultipleAccountsApiResponseBase = {
    /** indicates if the account contains a program (and is strictly read-only) */
    executable: boolean;
    /** number of lamports assigned to this account */
    lamports: LamportsUnsafeBeyond2Pow53Minus1;
    /** pubkey of the program this account has been assigned to */
    owner: Base58EncodedAddress;
    /** the epoch at which this account will next owe rent */
    rentEpoch: U64UnsafeBeyond2Pow53Minus1;
    /** the data size of the account */
    space: U64UnsafeBeyond2Pow53Minus1;
} | null;

type GetMultipleAccountsApiResponseWithBase58EncodedData_DEPRECATED = Readonly<{
    data: Base58EncodedDataResponse;
}>;

type GetMultipleAccountsApiResponseWithBase64EncodedData = Readonly<{
    data: Base64EncodedDataResponse;
}>;

type GetMultipleAccountsApiResponseWithBase64EncodedZStdCompressedData = Readonly<{
    data: Base64EncodedZStdCompressedDataResponse;
}>;

type GetMultipleAccountsApiResponseWithJsonData = Readonly<{
    data:
        | Readonly<{
              /** Name of the program that owns this account. */
              program: string;
              parsed: unknown;
              space: U64UnsafeBeyond2Pow53Minus1;
          }>
        // If `jsonParsed` encoding is requested but a parser cannot be found for the given
        // account the `data` field falls back to `base64`.
        | Base64EncodedDataResponse;
}>;

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
    ): RpcResponse<(GetMultipleAccountsApiResponseBase & GetMultipleAccountsApiResponseWithBase64EncodedData)[]>;
    getMultipleAccounts(
        /** An array of up to 100 Pubkeys to query */
        addresses: Base58EncodedAddress[],
        config: GetMultipleAccountsApiCommonConfig &
            GetMultipleAccountsApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base64+zstd';
            }>
    ): RpcResponse<
        (GetMultipleAccountsApiResponseBase & GetMultipleAccountsApiResponseWithBase64EncodedZStdCompressedData)[]
    >;
    getMultipleAccounts(
        /** An array of up to 100 Pubkeys to query */
        addresses: Base58EncodedAddress[],
        config: GetMultipleAccountsApiCommonConfig &
            Readonly<{
                encoding: 'jsonParsed';
            }>
    ): RpcResponse<(GetMultipleAccountsApiResponseBase & GetMultipleAccountsApiResponseWithJsonData)[]>;
    getMultipleAccounts(
        /** An array of up to 100 Pubkeys to query */
        addresses: Base58EncodedAddress[],
        config: GetMultipleAccountsApiCommonConfig &
            GetMultipleAccountsApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base58';
            }>
    ): RpcResponse<
        (GetMultipleAccountsApiResponseBase & GetMultipleAccountsApiResponseWithBase58EncodedData_DEPRECATED)[]
    >;
    getMultipleAccounts(
        /** An array of up to 100 Pubkeys to query */
        addresses: Base58EncodedAddress[],
        config?: GetMultipleAccountsApiCommonConfig
    ): RpcResponse<(GetMultipleAccountsApiResponseBase & GetMultipleAccountsApiResponseWithBase64EncodedData)[]>;
}
