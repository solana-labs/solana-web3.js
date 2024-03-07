import { SOLANA_ERROR__CODECS__NUMBER_OUT_OF_RANGE, SolanaError } from '@solana/errors';

/**
 * Asserts that a given number is between a given range.
 */
export function assertNumberIsBetweenForCodec(
    codecDescription: string,
    min: bigint | number,
    max: bigint | number,
    value: bigint | number,
) {
    if (value < min || value > max) {
        throw new SolanaError(SOLANA_ERROR__CODECS__NUMBER_OUT_OF_RANGE, {
            codecDescription,
            max,
            min,
            value,
        });
    }
}
