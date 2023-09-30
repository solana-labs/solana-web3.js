export type StringifiedNumber = string & { readonly __brand: unique symbol };

export function isStringifiedNumber(putativeNumber: string): putativeNumber is StringifiedNumber {
    return !Number.isNaN(Number(putativeNumber));
}

export function assertIsStringifiedNumber(putativeNumber: string): asserts putativeNumber is StringifiedNumber {
    if (Number.isNaN(Number(putativeNumber))) {
        throw new Error(`\`${putativeNumber}\` cannot be parsed as a Number`);
    }
}

export function stringifiedNumber(putativeNumber: string): StringifiedNumber {
    assertIsStringifiedNumber(putativeNumber);
    return putativeNumber;
}
