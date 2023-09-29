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
    } catch (e) {
        throw new Error(`\`${putativeBigInt}\` cannot be parsed as a BigInt`, {
            cause: e,
        });
    }
}

export function stringifiedBigInt(putativeBigInt: string): StringifiedBigInt {
    assertIsStringifiedBigInt(putativeBigInt);
    return putativeBigInt;
}
