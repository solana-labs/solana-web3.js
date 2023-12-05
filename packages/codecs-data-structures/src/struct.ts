import {
    Codec,
    combineCodec,
    createDecoder,
    createEncoder,
    Decoder,
    Encoder,
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    getEncodedSize,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';

import { getFixedSize, getMaxSize, sumCodecSizes } from './utils';

/** Get the name and encoder of each field in a struct. */
export type StructToEncoderTuple<TFrom extends object> = Array<
    {
        [K in keyof TFrom]: [K, Encoder<TFrom[K]>];
    }[keyof TFrom]
>;

/** Get the name and fixed-size encoder of each field in a struct. */
export type StructToFixedSizeEncoderTuple<TFrom extends object> = Array<
    {
        [K in keyof TFrom]: [K, FixedSizeEncoder<TFrom[K]>];
    }[keyof TFrom]
>;

/** Get the name and decoder of each field in a struct. */
export type StructToDecoderTuple<TTo extends object> = Array<
    {
        [K in keyof TTo]: [K, Decoder<TTo[K]>];
    }[keyof TTo]
>;

/** Get the name and fixed-size decoder of each field in a struct. */
export type StructToFixedSizeDecoderTuple<TTo extends object> = Array<
    {
        [K in keyof TTo]: [K, FixedSizeDecoder<TTo[K]>];
    }[keyof TTo]
>;

/** Get the name and codec of each field in a struct. */
export type StructToCodecTuple<TFrom extends object, TTo extends TFrom> = Array<
    {
        [K in keyof TFrom]: [K, Codec<TFrom[K], TTo[K]>];
    }[keyof TFrom]
>;

/** Get the name and fixed-size codec of each field in a struct. */
export type StructToFixedSizeCodecTuple<TFrom extends object, TTo extends TFrom> = Array<
    {
        [K in keyof TFrom]: [K, FixedSizeCodec<TFrom[K], TTo[K]>];
    }[keyof TFrom]
>;

/**
 * Creates a encoder for a custom object.
 *
 * @param fields - The name and encoder of each field.
 */
export function getStructEncoder<TFrom extends object>(
    fields: StructToFixedSizeEncoderTuple<TFrom>,
): FixedSizeEncoder<TFrom>;
export function getStructEncoder<TFrom extends object>(fields: StructToEncoderTuple<TFrom>): VariableSizeEncoder<TFrom>;
export function getStructEncoder<TFrom extends object>(fields: StructToEncoderTuple<TFrom>): Encoder<TFrom> {
    const fieldCodecs = fields.map(([, codec]) => codec);
    const fixedSize = sumCodecSizes(fieldCodecs.map(getFixedSize));
    const maxSize = sumCodecSizes(fieldCodecs.map(getMaxSize)) ?? undefined;

    return createEncoder({
        ...(fixedSize === null
            ? {
                  getSizeFromValue: (value: TFrom) =>
                      fields
                          .map(([key, codec]) => getEncodedSize(value[key], codec))
                          .reduce((all, one) => all + one, 0),
                  maxSize,
              }
            : { fixedSize }),
        write: (struct: TFrom, bytes, offset) => {
            fields.forEach(([key, codec]) => {
                offset = codec.write(struct[key], bytes, offset);
            });
            return offset;
        },
    });
}

/**
 * Creates a decoder for a custom object.
 *
 * @param fields - The name and decoder of each field.
 */
export function getStructDecoder<TTo extends object>(fields: StructToFixedSizeDecoderTuple<TTo>): FixedSizeDecoder<TTo>;
export function getStructDecoder<TTo extends object>(fields: StructToDecoderTuple<TTo>): VariableSizeDecoder<TTo>;
export function getStructDecoder<TTo extends object>(fields: StructToDecoderTuple<TTo>): Decoder<TTo> {
    const fieldCodecs = fields.map(([, codec]) => codec);
    const fixedSize = sumCodecSizes(fieldCodecs.map(getFixedSize));
    const maxSize = sumCodecSizes(fieldCodecs.map(getMaxSize)) ?? undefined;

    return createDecoder({
        ...(fixedSize === null ? { maxSize } : { fixedSize }),
        read: (bytes: Uint8Array, offset) => {
            const struct: Partial<TTo> = {};
            fields.forEach(([key, codec]) => {
                const [value, newOffset] = codec.read(bytes, offset);
                offset = newOffset;
                struct[key] = value;
            });
            return [struct as TTo, offset];
        },
    });
}

/**
 * Creates a codec for a custom object.
 *
 * @param fields - The name and codec of each field.
 */
export function getStructCodec<TFrom extends object, TTo extends TFrom = TFrom>(
    fields: StructToFixedSizeCodecTuple<TFrom, TTo>,
): FixedSizeCodec<TFrom, TTo>;
export function getStructCodec<TFrom extends object, TTo extends TFrom = TFrom>(
    fields: StructToCodecTuple<TFrom, TTo>,
): VariableSizeCodec<TFrom, TTo>;
export function getStructCodec<TFrom extends object, TTo extends TFrom = TFrom>(
    fields: StructToCodecTuple<TFrom, TTo>,
): Codec<TFrom, TTo> {
    return combineCodec(getStructEncoder(fields), getStructDecoder(fields));
}
