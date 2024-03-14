import { Codec, Decoder, Encoder, Offset } from './codec';
import { combineCodec } from './combine-codec';
import { offsetDecoder, offsetEncoder } from './offset-codec';
import { resizeDecoder, resizeEncoder } from './resize-codec';

/**
 * Adds left padding to the given encoder.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function padLeftEncoder<TEncoder extends Encoder<any>>(encoder: TEncoder, offset: Offset): TEncoder {
    return offsetEncoder(
        resizeEncoder(encoder, size => size + offset),
        { preOffset: ({ preOffset }) => preOffset + offset },
    );
}

/**
 * Adds right padding to the given encoder.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function padRightEncoder<TEncoder extends Encoder<any>>(encoder: TEncoder, offset: Offset): TEncoder {
    return offsetEncoder(
        resizeEncoder(encoder, size => size + offset),
        { postOffset: ({ postOffset }) => postOffset + offset },
    );
}

/**
 * Adds left padding to the given decoder.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function padLeftDecoder<TDecoder extends Decoder<any>>(decoder: TDecoder, offset: Offset): TDecoder {
    return offsetDecoder(
        resizeDecoder(decoder, size => size + offset),
        { preOffset: ({ preOffset }) => preOffset + offset },
    );
}

/**
 * Adds right padding to the given decoder.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function padRightDecoder<TDecoder extends Decoder<any>>(decoder: TDecoder, offset: Offset): TDecoder {
    return offsetDecoder(
        resizeDecoder(decoder, size => size + offset),
        { postOffset: ({ postOffset }) => postOffset + offset },
    );
}

/**
 * Adds left padding to the given codec.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function padLeftCodec<TCodec extends Codec<any>>(codec: TCodec, offset: Offset): TCodec {
    return combineCodec(padLeftEncoder(codec, offset), padLeftDecoder(codec, offset)) as TCodec;
}

/**
 * Adds right padding to the given codec.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function padRightCodec<TCodec extends Codec<any>>(codec: TCodec, offset: Offset): TCodec {
    return combineCodec(padRightEncoder(codec, offset), padRightDecoder(codec, offset)) as TCodec;
}
