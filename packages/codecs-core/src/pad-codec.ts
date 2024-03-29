import { Codec, Decoder, Encoder, Offset } from './codec';
import { combineCodec } from './combine-codec';
import { offsetDecoder, offsetEncoder } from './offset-codec';
import { resizeDecoder, resizeEncoder } from './resize-codec';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEncoder = Encoder<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDecoder = Decoder<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyCodec = Codec<any>;

/**
 * Adds left padding to the given encoder.
 */
export function padLeftEncoder<TEncoder extends AnyEncoder>(encoder: TEncoder, offset: Offset): TEncoder {
    return offsetEncoder(
        resizeEncoder(encoder, size => size + offset),
        { preOffset: ({ preOffset }) => preOffset + offset },
    );
}

/**
 * Adds right padding to the given encoder.
 */
export function padRightEncoder<TEncoder extends AnyEncoder>(encoder: TEncoder, offset: Offset): TEncoder {
    return offsetEncoder(
        resizeEncoder(encoder, size => size + offset),
        { postOffset: ({ postOffset }) => postOffset + offset },
    );
}

/**
 * Adds left padding to the given decoder.
 */
export function padLeftDecoder<TDecoder extends AnyDecoder>(decoder: TDecoder, offset: Offset): TDecoder {
    return offsetDecoder(
        resizeDecoder(decoder, size => size + offset),
        { preOffset: ({ preOffset }) => preOffset + offset },
    );
}

/**
 * Adds right padding to the given decoder.
 */
export function padRightDecoder<TDecoder extends AnyDecoder>(decoder: TDecoder, offset: Offset): TDecoder {
    return offsetDecoder(
        resizeDecoder(decoder, size => size + offset),
        { postOffset: ({ postOffset }) => postOffset + offset },
    );
}

/**
 * Adds left padding to the given codec.
 */
export function padLeftCodec<TCodec extends AnyCodec>(codec: TCodec, offset: Offset): TCodec {
    return combineCodec(padLeftEncoder(codec, offset), padLeftDecoder(codec, offset)) as TCodec;
}

/**
 * Adds right padding to the given codec.
 */
export function padRightCodec<TCodec extends AnyCodec>(codec: TCodec, offset: Offset): TCodec {
    return combineCodec(padRightEncoder(codec, offset), padRightDecoder(codec, offset)) as TCodec;
}
