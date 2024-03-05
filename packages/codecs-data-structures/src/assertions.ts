import { SOLANA_ERROR__CODECS_INVALID_NUMBER_OF_ITEMS, SolanaError } from '@solana/errors';

/** Checks the number of items in an array-like structure is expected. */
export function assertValidNumberOfItemsForCodec(
    codecDescription: string,
    expected: number | bigint,
    actual: number | bigint,
) {
    if (expected !== actual) {
        throw new SolanaError(SOLANA_ERROR__CODECS_INVALID_NUMBER_OF_ITEMS, {
            actual,
            codecDescription,
            expected,
        });
    }
}
