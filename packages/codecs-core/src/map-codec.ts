import { Codec, createCodec, createDecoder, createEncoder, Decoder, Encoder } from './codec';

/**
 * Converts an encoder A to a encoder B by mapping their values.
 */
export function mapEncoder<T, U>(encoder: Encoder<T>, unmap: (value: U) => T): Encoder<U> {
    return createEncoder({
        ...(encoder.fixedSize === null
            ? { ...encoder, variableSize: (value: U) => encoder.variableSize(unmap(value)) }
            : encoder),
        write: (value: U, bytes, offset) => encoder.write(unmap(value), bytes, offset),
    });
}

/**
 * Converts an decoder A to a decoder B by mapping their values.
 */
export function mapDecoder<T, U>(
    decoder: Decoder<T>,
    map: (value: T, bytes: Uint8Array, offset: number) => U,
): Decoder<U> {
    return createDecoder({
        ...decoder,
        read: (bytes: Uint8Array, offset = 0) => {
            const [value, newOffset] = decoder.read(bytes, offset);
            return [map(value, bytes, offset), newOffset];
        },
    });
}

/**
 * Converts a codec A to a codec B by mapping their values.
 */
export function mapCodec<NewFrom, OldFrom, To extends NewFrom & OldFrom>(
    codec: Codec<OldFrom, To>,
    unmap: (value: NewFrom) => OldFrom,
): Codec<NewFrom, To>;
export function mapCodec<NewFrom, OldFrom, NewTo extends NewFrom = NewFrom, OldTo extends OldFrom = OldFrom>(
    codec: Codec<OldFrom, OldTo>,
    unmap: (value: NewFrom) => OldFrom,
    map: (value: OldTo, bytes: Uint8Array, offset: number) => NewTo,
): Codec<NewFrom, NewTo>;
export function mapCodec<NewFrom, OldFrom, NewTo extends NewFrom = NewFrom, OldTo extends OldFrom = OldFrom>(
    codec: Codec<OldFrom, OldTo>,
    unmap: (value: NewFrom) => OldFrom,
    map?: (value: OldTo, bytes: Uint8Array, offset: number) => NewTo,
): Codec<NewFrom, NewTo> {
    return createCodec({
        ...mapEncoder(codec, unmap),
        read: map ? mapDecoder(codec, map).read : (codec.read as unknown as Decoder<NewTo>['read']),
    });
}
