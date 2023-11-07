import { Address } from '@solana/addresses';
import { LamportsUnsafeBeyond2Pow53Minus1, StringifiedBigInt, StringifiedNumber } from '@solana/rpc-types';

export type DataSlice = Readonly<{
    offset: number;
    length: number;
}>;

// FIXME(solana-labs/solana/issues/30341) Beware that any value above 9007199254740991 may be
// truncated or rounded because of a downcast to JavaScript `number` between your calling code and
// the JSON-RPC transport.
//
// Spefically being used to denote micro-lamports, which are 0.000001 lamports.
export type MicroLamportsUnsafeBeyond2Pow53Minus1 = bigint & { readonly __brand: unique symbol };

export type Slot = U64UnsafeBeyond2Pow53Minus1;

// FIXME(solana-labs/solana/issues/30341) Beware that any value above 9007199254740991 may be
// truncated or rounded because of a downcast to JavaScript `number` between your calling code and
// the JSON-RPC transport.
export type U64UnsafeBeyond2Pow53Minus1 = bigint;

// FIXME(solana-labs/solana/issues/30341) Beware that any value outside of range
// +/- 9007199254740991 may be truncated or rounded because of a downcast to JavaScript `number`
// between your calling code and the JSON-RPC transport.
export type SignedLamportsAsI64Unsafe = bigint;

// FIXME(solana-labs/solana/issues/30341)
// <https://stackoverflow.com/questions/45929493/node-js-maximum-safe-floating-point-number/57225494#57225494>
// Beware that floating-point value precision can vary widely:
// - For precision of 1 decimal place, anything above 562949953421311
// - For precision of 2 decimal places, anything above 70368744177663
// can be truncated or rounded because of a downcast to JavaScript `number` between your calling
// code and the JSON-RPC transport.
export type F64UnsafeSeeDocumentation = number;

export type RpcResponse<TValue> = Readonly<{
    context: Readonly<{
        slot: Slot;
    }>;
    value: TValue;
}>;

export type Base58EncodedBytes = string & { readonly __brand: unique symbol };
export type Base64EncodedBytes = string & { readonly __brand: unique symbol };
export type Base64EncodedZStdCompressedBytes = string & { readonly __brand: unique symbol };

export type Base58EncodedDataResponse = [Base58EncodedBytes, 'base58'];
export type Base64EncodedDataResponse = [Base64EncodedBytes, 'base64'];
export type Base64EncodedZStdCompressedDataResponse = [Base64EncodedZStdCompressedBytes, 'base64+zstd'];

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
        | Readonly<{
              // Name of the program that owns this account.
              program: string;
              parsed: unknown;
              space: U64UnsafeBeyond2Pow53Minus1;
          }>
        // If `jsonParsed` encoding is requested but a parser cannot be found for the given
        // account the `data` field falls back to `base64`.
        | Base64EncodedDataResponse;
}>;

export type AccountInfoWithPubkey<TAccount extends AccountInfoBase> = Readonly<{
    account: TAccount;
    pubkey: Address;
}>;

export type TokenAmount = Readonly<{
    amount: StringifiedBigInt;
    decimals: number;
    uiAmount: number | null;
    uiAmountString: StringifiedNumber;
}>;

export type TokenBalance = Readonly<{
    /** Index of the account in which the token balance is provided for. */
    accountIndex: number;
    /** Pubkey of the token's mint. */
    mint: Address;
    /** Pubkey of token balance's owner. */
    owner?: Address;
    /** Pubkey of the Token program that owns the account. */
    programId?: Address;
    uiTokenAmount: TokenAmount;
}>;

type TokenAccountState = 'initialized' | 'uninitialized' | 'frozen';

export type TokenAccount = Readonly<{
    mint: Address;
    owner: Address;
    tokenAmount: TokenAmount;
    delegate?: Address;
    state: TokenAccountState;
    isNative: boolean;
    rentExemptReserve?: TokenAmount;
    delegatedAmount?: TokenAmount;
    closeAuthority?: Address;
    extensions?: unknown[];
}>;

export type GetProgramAccountsMemcmpFilter = Readonly<{
    offset: U64UnsafeBeyond2Pow53Minus1;
    bytes: string;
    encoding: 'base58' | 'base64';
}>;

export type GetProgramAccountsDatasizeFilter = Readonly<{
    dataSize: U64UnsafeBeyond2Pow53Minus1;
}>;
