export type StringifiedNumber = string & { readonly __number: unique symbol };

export function assertIsStringifiedNumber(putativeNumber: string): asserts putativeNumber is StringifiedNumber {
    if (Number.isNaN(Number(putativeNumber))) {
        throw new Error(`\`${putativeNumber}\` cannot be parsed as a Number`);
    }
}
