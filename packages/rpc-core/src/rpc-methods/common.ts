export type Commitment = 'confirmed' | 'finalized' | 'processed';

export type DataSlice = Readonly<{
    offset: number;
    length: number;
}>;

// FIXME(solana-labs/solana/issues/30341) Beware that any value above 9007199254740991 may be
// truncated or rounded because of a downcast to JavaScript `number` between your calling code and
// the JSON-RPC transport.
export type LamportsUnsafeBeyond2Pow53Minus1 = bigint & { readonly __lamports: unique symbol };

// FIXME(solana-labs/solana/issues/30341) Beware that any value above 9007199254740991 may be
// truncated or rounded because of a downcast to JavaScript `number` between your calling code and
// the JSON-RPC transport.
//
// Spefically being used to denote micro-lamports, which are 0.000001 lamports.
export type MicroLamportsUnsafeBeyond2Pow53Minus1 = bigint & { readonly __lamports: unique symbol };

export type Slot = U64UnsafeBeyond2Pow53Minus1;

// FIXME(solana-labs/solana/issues/30341) Beware that any value above 9007199254740991 may be
// truncated or rounded because of a downcast to JavaScript `number` between your calling code and
// the JSON-RPC transport.
export type U64UnsafeBeyond2Pow53Minus1 = bigint;

export type RpcResponse<TValue> = Readonly<{
    context: Readonly<{
        slot: Slot;
    }>;
    value: TValue;
}>;

export type Base58EncodedBytes = string & { readonly __base58EncodedBytes: unique symbol };
export type Base64EncodedBytes = string & { readonly __base64EncodedBytes: unique symbol };
export type Base64EncodedZStdCompressedBytes = string & { readonly __base64EncodedZStdCompressedBytes: unique symbol };

export type Base58EncodedDataResponse = [Base58EncodedBytes, 'base58'];
export type Base64EncodedDataResponse = [Base64EncodedBytes, 'base64'];
export type Base64EncodedZStdCompressedDataResponse = [Base64EncodedZStdCompressedBytes, 'base64+zstd'];

export type Base58EncodedTransactionSignature = string & { readonly __base58EncodedSignature: unique symbol };
