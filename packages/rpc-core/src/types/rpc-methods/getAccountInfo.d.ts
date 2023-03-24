import { Base58EncodedAddress } from '@solana/keys';

type Base64EncodedBytes = string & { readonly __base64EncodedBytes: unique symbol };
type Base64EncodedZStdCompressedBytes = string & { readonly __base64EncodedZStdCompressedBytes: unique symbol };

type Base64EncodedDataResponse = [Base64EncodedBytes, 'base64'];
type Base64EncodedZStdCompressedDataResponse = [Base64EncodedZStdCompressedBytes, 'base64+zstd'];

type GetAccountInfoApiResponseBase = Readonly<{
    context: Readonly<{
        slot: Slot;
    }>;
    value: Readonly<{
        executable: boolean;
        lamports: U64UnsafeBeyond2Pow53Minus1;
        owner: Base58EncodedAddress;
        rentEpoch: U64UnsafeBeyond2Pow53Minus1;
        space: U64UnsafeBeyond2Pow53Minus1;
    }> | null;
}>;

type GetAccountInfoApiResponseWithEncodedData = Readonly<{
    value: Readonly<{
        data: Base64EncodedDataResponse;
    }> | null;
}>;

type GetAccountInfoApiResponseWithEncodedZStdCompressedData = Readonly<{
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

type GetAccountInfoApiCommonConfig = readonly {
    // Defaults to `finalized`
    commitment?: Commitment;
    // The minimum slot that the request can be evaluated at
    minContextSlot?: Slot;
};

type GetAccountInfoApiBase64EncodingCommonConfig = readonly {
    // Limit the returned account data using the provided "offset: <usize>" and "length: <usize>" fields.
    dataSlice?: DataSlice;
};

export interface GetAccountInfoApi {
    /**
     * Returns all information associated with the account of provided public key
     */
    getAccountInfo(
        address: Base58EncodedAddress,
        config?: readonly {
            encoding: 'base64';
        } &
            GetAccountInfoApiCommonConfig &
            GetAccountInfoApiBase64EncodingCommonConfig
    ): Promise<GetAccountInfoApiResponseBase & GetAccountInfoApiResponseWithEncodedData>;
    getAccountInfo(
        address: Base58EncodedAddress,
        config?: readonly {
            encoding: 'base64+zstd';
        } &
            GetAccountInfoApiCommonConfig &
            GetAccountInfoApiBase64EncodingCommonConfig
    ): Promise<GetAccountInfoApiResponseBase & GetAccountInfoApiResponseWithEncodedZStdCompressedData>;
    getAccountInfo(
        address: Base58EncodedAddress,
        config?: readonly {
            encoding: 'jsonParsed';
        } &
            GetAccountInfoApiCommonConfig
    ): Promise<GetAccountInfoApiResponseBase & GetAccountInfoApiResponseWithJsonData>;
}
