import {
    Codec,
    Decoder,
    Encoder,
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from './codec';

/**
 * Combines an encoder and a decoder into a codec.
 * The encoder and decoder must have the same fixed size, max size and description.
 * If a description is provided, it will override the encoder and decoder descriptions.
 */
export function combineCodec<From, To extends From = From>(
    encoder: FixedSizeEncoder<From>,
    decoder: FixedSizeDecoder<To>
): FixedSizeCodec<From, To>;
export function combineCodec<From, To extends From = From>(
    encoder: VariableSizeEncoder<From>,
    decoder: VariableSizeDecoder<To>
): VariableSizeCodec<From, To>;
export function combineCodec<From, To extends From = From>(
    encoder: Encoder<From>,
    decoder: Decoder<To>
): Codec<From, To>;
export function combineCodec<From, To extends From = From>(
    encoder: Encoder<From>,
    decoder: Decoder<To>
): Codec<From, To> {
    if (encoder.fixedSize !== decoder.fixedSize) {
        // TODO: Coded error.
        throw new Error(
            `Encoder and decoder must have the same fixed size, got [${encoder.fixedSize}] and [${decoder.fixedSize}].`
        );
    }

    if (encoder.fixedSize === null && decoder.fixedSize === null && encoder.maxSize !== decoder.maxSize) {
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
