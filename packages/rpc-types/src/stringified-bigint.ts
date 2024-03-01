import { SOLANA_ERROR__MALFORMED_BIGINT_STRING, SolanaError } from '@solana/errors';

export type StringifiedBigInt = string & { readonly __brand: unique symbol };

export function isStringifiedBigInt(putativeBigInt: string): putativeBigInt is StringifiedBigInt {
    try {
        BigInt(putativeBigInt);
        return true;
    } catch (_) {
        return false;
    }
}

export function assertIsStringifiedBigInt(putativeBigInt: string): asserts putativeBigInt is StringifiedBigInt {
    try {
        BigInt(putativeBigInt);
    } catch {
        throw new SolanaError(SOLANA_ERROR__MALFORMED_BIGINT_STRING, {
            value: putativeBigInt,
        });
    }
}

export function stringifiedBigInt(putativeBigInt: string): StringifiedBigInt {
    assertIsStringifiedBigInt(putativeBigInt);
    return putativeBigInt;
}
