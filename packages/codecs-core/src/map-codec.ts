import { Codec, Decoder, Encoder } from './codec';

/**
 * Converts an encoder A to a encoder B by mapping their values.
 */
export function mapEncoder<T, U>(encoder: Encoder<T>, unmap: (value: U) => T): Encoder<U> {
    return {
        description: encoder.description,
        encode: (value: U) => encoder.encode(unmap(value)),
        fixedSize: encoder.fixedSize,
        maxSize: encoder.maxSize,
    };
}

/**
 * Converts an decoder A to a decoder B by mapping their values.
 */
export function mapDecoder<T, U>(
    decoder: Decoder<T>,
    map: (value: T, bytes: Uint8Array, offset: number) => U
): Decoder<U> {
    return {
        decode: (bytes: Uint8Array, offset = 0) => {
            const [value, length] = decoder.decode(bytes, offset);
            return [map(value, bytes, offset), length];
        },
        description: decoder.description,
        fixedSize: decoder.fixedSize,
        maxSize: decoder.maxSize,
    };
}

/**
 * Converts a codec A to a codec B by mapping their values.
 */
export function mapCodec<NewFrom, OldFrom, To extends NewFrom & OldFrom>(
    codec: Codec<OldFrom, To>,
    unmap: (value: NewFrom) => OldFrom
): Codec<NewFrom, To>;
export function mapCodec<NewFrom, OldFrom, NewTo extends NewFrom = NewFrom, OldTo extends OldFrom = OldFrom>(
    codec: Codec<OldFrom, OldTo>,
    unmap: (value: NewFrom) => OldFrom,
    map: (value: OldTo, bytes: Uint8Array, offset: number) => NewTo
): Codec<NewFrom, NewTo>;
export function mapCodec<NewFrom, OldFrom, NewTo extends NewFrom = NewFrom, OldTo extends OldFrom = OldFrom>(
    codec: Codec<OldFrom, OldTo>,
    unmap: (value: NewFrom) => OldFrom,
    map?: (value: OldTo, bytes: Uint8Array, offset: number) => NewTo
): Codec<NewFrom, NewTo> {
    return {
        decode: map ? mapDecoder(codec, map).decode : (codec.decode as unknown as Decoder<NewTo>['decode']),
        description: codec.description,
        encode: mapEncoder(codec, unmap).encode,
        fixedSize: codec.fixedSize,
        maxSize: codec.maxSize,
    };
}
