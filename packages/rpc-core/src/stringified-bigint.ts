export type StringifiedBigInt = string & { readonly __brand: unique symbol };

export function assertIsStringifiedBigInt(putativeBigInt: string): asserts putativeBigInt is StringifiedBigInt {
    try {
        BigInt(putativeBigInt);
    } catch (e) {
        throw new Error(`\`${putativeBigInt}\` cannot be parsed as a BigInt`, {
            cause: e,
        });
    }
}
