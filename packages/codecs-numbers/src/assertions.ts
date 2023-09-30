/**
 * Asserts that a given number is between a given range.
 */
export function assertNumberIsBetweenForCodec(
    codecDescription: string,
    min: number | bigint,
    max: number | bigint,
    value: number | bigint
) {
    if (value < min || value > max) {
        // TODO: Coded error.
        throw new Error(
            `Codec [${codecDescription}] expected number to be in the range [${min}, ${max}], got ${value}.`
        );
    }
}
