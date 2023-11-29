import {
    Codec,
    Decoder,
    Encoder,
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    isFixedSizeCodec,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from './codec';

/**
 * Combines an encoder and a decoder into a codec.
 * The encoder and decoder must have the same fixed size, max size and description.
 * If a description is provided, it will override the encoder and decoder descriptions.
 */
export function combineCodec<TFrom, TTo extends TFrom, TSize extends number>(
    encoder: FixedSizeEncoder<TFrom, TSize>,
    decoder: FixedSizeDecoder<TTo, TSize>
): FixedSizeCodec<TFrom, TTo, TSize>;
export function combineCodec<TFrom, TTo extends TFrom>(
    encoder: VariableSizeEncoder<TFrom>,
    decoder: VariableSizeDecoder<TTo>
): VariableSizeCodec<TFrom, TTo>;
export function combineCodec<TFrom, TTo extends TFrom>(
    encoder: Encoder<TFrom>,
    decoder: Decoder<TTo>
): Codec<TFrom, TTo>;
export function combineCodec<TFrom, TTo extends TFrom>(
    encoder: Encoder<TFrom>,
    decoder: Decoder<TTo>
): Codec<TFrom, TTo> {
    if (isFixedSizeCodec(encoder) !== isFixedSizeCodec(decoder)) {
        // TODO: Coded error.
        throw new Error(`Encoder and decoder must either both be fixed-size or variable-size.`);
    }

    if (isFixedSizeCodec(encoder) && isFixedSizeCodec(decoder) && encoder.fixedSize !== decoder.fixedSize) {
        // TODO: Coded error.
        throw new Error(
            `Encoder and decoder must have the same fixed size, got [${encoder.fixedSize}] and [${decoder.fixedSize}].`
        );
    }

    if (!isFixedSizeCodec(encoder) && !isFixedSizeCodec(decoder) && encoder.maxSize !== decoder.maxSize) {
        // TODO: Coded error.
        throw new Error(
            `Encoder and decoder must have the same max size, got [${encoder.maxSize}] and [${decoder.maxSize}].`
        );
    }

    return {
        ...decoder,
        ...encoder,
        decode: decoder.decode,
        encode: encoder.encode,
        read: decoder.read,
        write: encoder.write,
    };
}
