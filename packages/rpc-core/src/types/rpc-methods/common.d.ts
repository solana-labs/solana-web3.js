// TODO: Eventually move this into whatever package implements transactions
declare type Commitment = 'confirmed' | 'finalized' | 'processed';

declare type DataSlice = readonly {
    offset: number;
    length: number;
};

declare type Slot = U64UnsafeBeyond2Pow53Minus1;

// FIXME(solana-labs/solana/issues/30341) Beware that any value above 9007199254740991 may be
// truncated or rounded because of a downcast to JavaScript `number` between your calling code and
// the JSON-RPC transport.
declare type U64UnsafeBeyond2Pow53Minus1 = bigint;
