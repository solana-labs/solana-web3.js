import { Base58EncodedAddress } from '@solana/addresses';

import {
    Base58EncodedBytes,
    Base58EncodedDataResponse,
    Base64EncodedDataResponse,
    Base64EncodedZStdCompressedDataResponse,
    Commitment,
    DataSlice,
    LamportsUnsafeBeyond2Pow53Minus1,
    Slot,
    U64UnsafeBeyond2Pow53Minus1,
} from './common';

type GetAccountInfoApiResponseBase = Readonly<{
    context: Readonly<{
        slot: Slot;
    }>;
    value: Readonly<{
        executable: boolean;
        lamports: LamportsUnsafeBeyond2Pow53Minus1;
        owner: Base58EncodedAddress;
        rentEpoch: U64UnsafeBeyond2Pow53Minus1;
        space: U64UnsafeBeyond2Pow53Minus1;
    }> | null;
}>;

type GetAccountInfoApiResponseWithDefaultData = Readonly<{
    value: Readonly<{
        data: Base58EncodedBytes;
    }> | null;
}>;

type GetAccountInfoApiResponseWithBase58EncodedData_DEPRECATED = Readonly<{
    value: Readonly<{
        data: Base58EncodedDataResponse;
    }> | null;
}>;

type GetAccountInfoApiResponseWithBase64EncodedData = Readonly<{
    value: Readonly<{
        data: Base64EncodedDataResponse;
    }> | null;
}>;

type GetAccountInfoApiResponseWithBase64EncodedZStdCompressedData = Readonly<{
    value: Readonly<{
        data: Base64EncodedZStdCompressedDataResponse;
    }> | null;
}>;

type GetAccountInfoApiResponseWithJsonData = Readonly<{
    value: Readonly<{
        data:
            | Readonly<{
                  // Name of the program that owns this account.
                  program: string;
                  parsed: unknown;
                  space: U64UnsafeBeyond2Pow53Minus1;
              }>
            // If `jsonParsed` encoding is requested but a parser cannot be found for the given
            // account the `data` field falls back to `base64`.
            | Base64EncodedDataResponse;
    }> | null;
}>;

type GetAccountInfoApiCommonConfig = Readonly<{
    // Defaults to `finalized`
    commitment?: Commitment;
    // The minimum slot that the request can be evaluated at
    minContextSlot?: Slot;
}>;

type GetAccountInfoApiSliceableCommonConfig = Readonly<{
    // Limit the returned account data using the provided "offset: <usize>" and "length: <usize>" fields.
    dataSlice?: DataSlice;
}>;

export interface GetAccountInfoApi {
    /**
     * Returns all information associated with the account of provided public key
     */
    getAccountInfo(
        address: Base58EncodedAddress,
        config: GetAccountInfoApiCommonConfig &
            GetAccountInfoApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base64';
            }>
    ): GetAccountInfoApiResponseBase & GetAccountInfoApiResponseWithBase64EncodedData;
    getAccountInfo(
        address: Base58EncodedAddress,
        config: GetAccountInfoApiCommonConfig &
            GetAccountInfoApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base64+zstd';
            }>
    ): GetAccountInfoApiResponseBase & GetAccountInfoApiResponseWithBase64EncodedZStdCompressedData;
    getAccountInfo(
        address: Base58EncodedAddress,
        config: GetAccountInfoApiCommonConfig &
            Readonly<{
                encoding: 'jsonParsed';
            }>
    ): GetAccountInfoApiResponseBase & GetAccountInfoApiResponseWithJsonData;
    getAccountInfo(
        address: Base58EncodedAddress,
        config: GetAccountInfoApiCommonConfig &
            GetAccountInfoApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base58';
            }>
    ): GetAccountInfoApiResponseBase & GetAccountInfoApiResponseWithBase58EncodedData_DEPRECATED;
    getAccountInfo(
        address: Base58EncodedAddress,
        config?: GetAccountInfoApiCommonConfig
    ): GetAccountInfoApiResponseBase & GetAccountInfoApiResponseWithDefaultData;
}
