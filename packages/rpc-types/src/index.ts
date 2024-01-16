export * from './blockhash';
export * from './commitment';
export * from './encoded-bytes';
export * from './lamports';
export * from './stringified-bigint';
export * from './stringified-number';
export * from './token-amount';
export * from './unix-timestamp';

// FIXME(solana-labs/solana/issues/30341) Beware that any value above 9007199254740991 may be
// truncated or rounded because of a downcast to JavaScript `number` between your calling code and
// the JSON-RPC transport.
export type U64UnsafeBeyond2Pow53Minus1 = bigint;

export type Slot = U64UnsafeBeyond2Pow53Minus1;
export type Epoch = U64UnsafeBeyond2Pow53Minus1;
