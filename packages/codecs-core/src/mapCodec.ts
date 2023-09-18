/* eslint-disable sort-keys-fix/sort-keys-fix */
import { Codec, Decoder, Encoder } from './codec';

/**
 * Converts an encoder A to a encoder B by mapping their values.
 */
export function mapEncoder<T, U>(encoder: Encoder<T>, unmap: (value: U) => T): Encoder<U> {
    return {
        description: encoder.description,
        fixedSize: encoder.fixedSize,
        maxSize: encoder.maxSize,
        encode: (value: U) => encoder.encode(unmap(value)),
    };
}

/**
 * Converts an decoder A to a decoder B by mapping their values.
 */
export function mapDecoder<T, U>(
    decoder: Decoder<T>,
    map: (value: T, buffer: Uint8Array, offset: number) => U
): Decoder<U> {
    return {
        description: decoder.description,
        fixedSize: decoder.fixedSize,
        maxSize: decoder.maxSize,
        decode: (buffer: Uint8Array, offset = 0) => {
            const [value, length] = decoder.decode(buffer, offset);
            return [map(value, buffer, offset), length];
        },
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
    map: (value: OldTo, buffer: Uint8Array, offset: number) => NewTo
): Codec<NewFrom, NewTo>;
export function mapCodec<NewFrom, OldFrom, NewTo extends NewFrom = NewFrom, OldTo extends OldFrom = OldFrom>(
    codec: Codec<OldFrom, OldTo>,
    unmap: (value: NewFrom) => OldFrom,
    map?: (value: OldTo, buffer: Uint8Array, offset: number) => NewTo
): Codec<NewFrom, NewTo> {
    return {
        description: codec.description,
        fixedSize: codec.fixedSize,
        maxSize: codec.maxSize,
        encode: mapEncoder(codec, unmap).encode,
        decode: map ? mapDecoder(codec, map).decode : (codec.decode as unknown as Decoder<NewTo>['decode']),
    };
}
