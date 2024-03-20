import {
    Codec,
    createCodec,
    createDecoder,
    createEncoder,
    Decoder,
    Encoder,
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    isVariableSize,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from './codec.js';

/**
 * Converts an encoder A to a encoder B by mapping their values.
 */
export function mapEncoder<TOldFrom, TNewFrom, TSize extends number>(
    encoder: FixedSizeEncoder<TOldFrom, TSize>,
    unmap: (value: TNewFrom) => TOldFrom,
): FixedSizeEncoder<TNewFrom, TSize>;
export function mapEncoder<TOldFrom, TNewFrom>(
    encoder: VariableSizeEncoder<TOldFrom>,
    unmap: (value: TNewFrom) => TOldFrom,
): VariableSizeEncoder<TNewFrom>;
export function mapEncoder<TOldFrom, TNewFrom>(
    encoder: Encoder<TOldFrom>,
    unmap: (value: TNewFrom) => TOldFrom,
): Encoder<TNewFrom>;
export function mapEncoder<TOldFrom, TNewFrom>(
    encoder: Encoder<TOldFrom>,
    unmap: (value: TNewFrom) => TOldFrom,
): Encoder<TNewFrom> {
    return createEncoder({
        ...(isVariableSize(encoder)
            ? { ...encoder, getSizeFromValue: (value: TNewFrom) => encoder.getSizeFromValue(unmap(value)) }
            : encoder),
        write: (value: TNewFrom, bytes, offset) => encoder.write(unmap(value), bytes, offset),
    });
}

/**
 * Converts an decoder A to a decoder B by mapping their values.
 */
export function mapDecoder<TOldTo, TNewTo, TSize extends number>(
    decoder: FixedSizeDecoder<TOldTo, TSize>,
    map: (value: TOldTo, bytes: Uint8Array, offset: number) => TNewTo,
): FixedSizeDecoder<TNewTo, TSize>;
export function mapDecoder<TOldTo, TNewTo>(
    decoder: VariableSizeDecoder<TOldTo>,
    map: (value: TOldTo, bytes: Uint8Array, offset: number) => TNewTo,
): VariableSizeDecoder<TNewTo>;
export function mapDecoder<TOldTo, TNewTo>(
    decoder: Decoder<TOldTo>,
    map: (value: TOldTo, bytes: Uint8Array, offset: number) => TNewTo,
): Decoder<TNewTo>;
export function mapDecoder<TOldTo, TNewTo>(
    decoder: Decoder<TOldTo>,
    map: (value: TOldTo, bytes: Uint8Array, offset: number) => TNewTo,
): Decoder<TNewTo> {
    return createDecoder({
        ...decoder,
        read: (bytes: Uint8Array, offset) => {
            const [value, newOffset] = decoder.read(bytes, offset);
            return [map(value, bytes, offset), newOffset];
        },
    });
}

/**
 * Converts a codec A to a codec B by mapping their values.
 */
export function mapCodec<TOldFrom, TNewFrom, TTo extends TNewFrom & TOldFrom, TSize extends number>(
    codec: FixedSizeCodec<TOldFrom, TTo, TSize>,
    unmap: (value: TNewFrom) => TOldFrom,
): FixedSizeCodec<TNewFrom, TTo, TSize>;
export function mapCodec<TOldFrom, TNewFrom, TTo extends TNewFrom & TOldFrom>(
    codec: VariableSizeCodec<TOldFrom, TTo>,
    unmap: (value: TNewFrom) => TOldFrom,
): VariableSizeCodec<TNewFrom, TTo>;
export function mapCodec<TOldFrom, TNewFrom, TTo extends TNewFrom & TOldFrom>(
    codec: Codec<TOldFrom, TTo>,
    unmap: (value: TNewFrom) => TOldFrom,
): Codec<TNewFrom, TTo>;
export function mapCodec<TOldFrom, TNewFrom, TOldTo extends TOldFrom, TNewTo extends TNewFrom, TSize extends number>(
    codec: FixedSizeCodec<TOldFrom, TOldTo, TSize>,
    unmap: (value: TNewFrom) => TOldFrom,
    map: (value: TOldTo, bytes: Uint8Array, offset: number) => TNewTo,
): FixedSizeCodec<TNewFrom, TNewTo, TSize>;
export function mapCodec<TOldFrom, TNewFrom, TOldTo extends TOldFrom, TNewTo extends TNewFrom>(
    codec: VariableSizeCodec<TOldFrom, TOldTo>,
    unmap: (value: TNewFrom) => TOldFrom,
    map: (value: TOldTo, bytes: Uint8Array, offset: number) => TNewTo,
): VariableSizeCodec<TNewFrom, TNewTo>;
export function mapCodec<TOldFrom, TNewFrom, TOldTo extends TOldFrom, TNewTo extends TNewFrom>(
    codec: Codec<TOldFrom, TOldTo>,
    unmap: (value: TNewFrom) => TOldFrom,
    map: (value: TOldTo, bytes: Uint8Array, offset: number) => TNewTo,
): Codec<TNewFrom, TNewTo>;
export function mapCodec<TOldFrom, TNewFrom, TOldTo extends TOldFrom, TNewTo extends TNewFrom>(
    codec: Codec<TOldFrom, TOldTo>,
    unmap: (value: TNewFrom) => TOldFrom,
    map?: (value: TOldTo, bytes: Uint8Array, offset: number) => TNewTo,
): Codec<TNewFrom, TNewTo> {
    return createCodec({
        ...mapEncoder(codec, unmap),
        read: map ? mapDecoder(codec, map).read : (codec.read as unknown as Decoder<TNewTo>['read']),
    });
}
