import { SOLANA_ERROR__MALFORMED_NUMBER_STRING, SolanaError } from '@solana/errors';

export type StringifiedNumber = string & { readonly __brand: unique symbol };

export function isStringifiedNumber(putativeNumber: string): putativeNumber is StringifiedNumber {
    return !Number.isNaN(Number(putativeNumber));
}

export function assertIsStringifiedNumber(putativeNumber: string): asserts putativeNumber is StringifiedNumber {
    if (Number.isNaN(Number(putativeNumber))) {
        throw new SolanaError(SOLANA_ERROR__MALFORMED_NUMBER_STRING, {
            value: putativeNumber,
        });
    }
}

export function stringifiedNumber(putativeNumber: string): StringifiedNumber {
    assertIsStringifiedNumber(putativeNumber);
    return putativeNumber;
}
