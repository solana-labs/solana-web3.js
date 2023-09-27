import { Codec, Decoder, Encoder } from './codec';

/**
 * Combines an encoder and a decoder into a codec.
 * The encoder and decoder must have the same fixed size, max size and description.
 * If a description is provided, it will override the encoder and decoder descriptions.
 */
export function combineCodec<From, To extends From = From>(
    encoder: Encoder<From>,
    decoder: Decoder<To>,
    description?: string
): Codec<From, To> {
    if (encoder.fixedSize !== decoder.fixedSize) {
        // TODO: Coded error.
        throw new Error(
            `Encoder and decoder must have the same fixed size, got [${encoder.fixedSize}] and [${decoder.fixedSize}].`
        );
    }

    if (encoder.maxSize !== decoder.maxSize) {
        // TODO: Coded error.
        throw new Error(
            `Encoder and decoder must have the same max size, got [${encoder.maxSize}] and [${decoder.maxSize}].`
        );
    }

    if (description === undefined && encoder.description !== decoder.description) {
        // TODO: Coded error.
        throw new Error(
            `Encoder and decoder must have the same description, got [${encoder.description}] and [${decoder.description}]. ` +
                `Pass a custom description as a third argument if you want to override the description and bypass this error.`
        );
    }

    return {
        decode: decoder.decode,
        description: description ?? encoder.description,
        encode: encoder.encode,
        fixedSize: encoder.fixedSize,
        maxSize: encoder.maxSize,
    };
}
