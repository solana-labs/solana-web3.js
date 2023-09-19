import { NumberOutOfRangeCodecError } from './errors';

/**
 * Asserts that a given buffer is not empty.
 */
export function assertNumberIsBetweenForCodec(
    codecName: string,
    min: number | bigint,
    max: number | bigint,
    value: number | bigint
) {
    if (value < min || value > max) {
        throw new NumberOutOfRangeCodecError(codecName, min, max, value);
    }
}
