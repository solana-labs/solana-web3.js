import { Address } from '@solana/addresses';
import type {
    Base58EncodedBytes,
    Base58EncodedDataResponse,
    Base64EncodedDataResponse,
    Base64EncodedZStdCompressedDataResponse,
    LamportsUnsafeBeyond2Pow53Minus1,
    U64UnsafeBeyond2Pow53Minus1,
} from '@solana/rpc-types';

export type DataSlice = Readonly<{
    offset: number;
    length: number;
}>;

export type AccountInfoBase = Readonly<{
    /** indicates if the account contains a program (and is strictly read-only) */
    executable: boolean;
    /** number of lamports assigned to this account */
    lamports: LamportsUnsafeBeyond2Pow53Minus1;
    /** pubkey of the program this account has been assigned to */
    owner: Address;
    /** the epoch at which this account will next owe rent */
    rentEpoch: U64UnsafeBeyond2Pow53Minus1;
}>;

/** @deprecated */
export type AccountInfoWithBase58Bytes = Readonly<{
    data: Base58EncodedBytes;
}>;

/** @deprecated */
export type AccountInfoWithBase58EncodedData = Readonly<{
    data: Base58EncodedDataResponse;
}>;

export type AccountInfoWithBase64EncodedData = Readonly<{
    data: Base64EncodedDataResponse;
}>;

export type AccountInfoWithBase64EncodedZStdCompressedData = Readonly<{
    data: Base64EncodedZStdCompressedDataResponse;
}>;

export type AccountInfoWithJsonData = Readonly<{
    data:
        | JsonParsedDataResponse
        // If `jsonParsed` encoding is requested but a parser cannot be found for the given
        // account the `data` field falls back to `base64`.
        | Base64EncodedDataResponse;
}>;

export type JsonParsedDataResponse<TData = object> = Readonly<{
    // Name of the program that owns this account.
    program: string;
    parsed: {
        info?: TData;
        type: string;
    };
    space: U64UnsafeBeyond2Pow53Minus1;
}>;
