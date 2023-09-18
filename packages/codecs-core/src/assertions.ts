import { CodecData } from './codec';
import { ExpectedFixedSizeCodecError } from './errors';

/**
 * Asserts that a given codec is fixed-size codec.
 */
export function assertFixedSizeCodec(
    data: Pick<CodecData, 'fixedSize'>,
    message?: string
): asserts data is { fixedSize: number } {
    const fixedSize = data.fixedSize;
    if (fixedSize === null) {
        throw new ExpectedFixedSizeCodecError(message);
    }
}
