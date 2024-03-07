import type { Address } from '@solana/addresses';

import type {
    Base58EncodedBytes,
    Base58EncodedDataResponse,
    Base64EncodedDataResponse,
    Base64EncodedZStdCompressedDataResponse,
} from './encoded-bytes';
import type { LamportsUnsafeBeyond2Pow53Minus1 } from './lamports';
import type { U64UnsafeBeyond2Pow53Minus1 } from './typed-numbers';

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
        | Base64EncodedDataResponse // If `jsonParsed` encoding is requested but a parser cannot be found for the given account the `data` field falls back to `base64`.
        | Readonly<{
              parsed: {
                  info?: object;
                  type: string;
              };
              // Name of the program that owns this account.
              program: string;
              space: U64UnsafeBeyond2Pow53Minus1;
          }>;
}>;

export type AccountInfoWithPubkey<TAccount extends AccountInfoBase> = Readonly<{
    account: TAccount;
    pubkey: Address;
}>;
