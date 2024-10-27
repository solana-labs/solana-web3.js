export type U64 = bigint;
export type I64 = bigint;

export type Slot = U64;
export type Epoch = U64;

// Specifically being used to denote micro-lamports, which are 0.000001 lamports.
export type MicroLamports = U64 & { readonly __brand: unique symbol };
export type SignedLamports = I64;

// FIXME(solana-labs/solana/issues/30341)
// <https://stackoverflow.com/questions/45929493/node-js-maximum-safe-floating-point-number/57225494#57225494>
// Beware that floating-point value precision can vary widely:
// - For precision of 1 decimal place, anything above 562949953421311
// - For precision of 2 decimal places, anything above 70368744177663
// can be truncated or rounded because of a downcast to JavaScript `number` between your calling
// code and the JSON-RPC transport.
export type F64UnsafeSeeDocumentation = number;
