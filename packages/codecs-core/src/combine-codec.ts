import {
    SOLANA_ERROR__CODECS__ENCODER_DECODER_FIXED_SIZE_MISMATCH,
    SOLANA_ERROR__CODECS__ENCODER_DECODER_MAX_SIZE_MISMATCH,
    SOLANA_ERROR__CODECS__ENCODER_DECODER_SIZE_COMPATIBILITY_MISMATCH,
    SolanaError,
} from '@solana/errors';

import {
    Codec,
    Decoder,
    Encoder,
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    isFixedSize,
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
    decoder: FixedSizeDecoder<TTo, TSize>,
): FixedSizeCodec<TFrom, TTo, TSize>;
export function combineCodec<TFrom, TTo extends TFrom>(
    encoder: VariableSizeEncoder<TFrom>,
    decoder: VariableSizeDecoder<TTo>,
): VariableSizeCodec<TFrom, TTo>;
export function combineCodec<TFrom, TTo extends TFrom>(
    encoder: Encoder<TFrom>,
    decoder: Decoder<TTo>,
): Codec<TFrom, TTo>;
export function combineCodec<TFrom, TTo extends TFrom>(
    encoder: Encoder<TFrom>,
    decoder: Decoder<TTo>,
): Codec<TFrom, TTo> {
    if (isFixedSize(encoder) !== isFixedSize(decoder)) {
        throw new SolanaError(SOLANA_ERROR__CODECS__ENCODER_DECODER_SIZE_COMPATIBILITY_MISMATCH);
    }

    if (isFixedSize(encoder) && isFixedSize(decoder) && encoder.fixedSize !== decoder.fixedSize) {
        throw new SolanaError(SOLANA_ERROR__CODECS__ENCODER_DECODER_FIXED_SIZE_MISMATCH, {
            decoderFixedSize: decoder.fixedSize,
            encoderFixedSize: encoder.fixedSize,
        });
    }

    if (!isFixedSize(encoder) && !isFixedSize(decoder) && encoder.maxSize !== decoder.maxSize) {
        throw new SolanaError(SOLANA_ERROR__CODECS__ENCODER_DECODER_MAX_SIZE_MISMATCH, {
            decoderMaxSize: decoder.maxSize,
            encoderMaxSize: encoder.maxSize,
        });
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
