/* eslint-disable @typescript-eslint/no-explicit-any */
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
    ReadonlyUint8Array,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';

import { DrainOuterGeneric, getFixedSize, getMaxSize, sumCodecSizes } from './utils';

type Fields<T> = readonly (readonly [string, T])[];
type ArrayIndices<T extends readonly unknown[]> = Exclude<Partial<T>['length'], T['length']> & number;

type GetEncoderTypeFromFields<TFields extends Fields<Encoder<any>>> = DrainOuterGeneric<{
    [I in ArrayIndices<TFields> as TFields[I][0]]: TFields[I][1] extends Encoder<infer TFrom> ? TFrom : never;
}>;

type GetDecoderTypeFromFields<TFields extends Fields<Decoder<any>>> = DrainOuterGeneric<{
    [I in ArrayIndices<TFields> as TFields[I][0]]: TFields[I][1] extends Decoder<infer TTo> ? TTo : never;
}>;

/**
 * Creates a encoder for a custom object.
 *
 * @param fields - The name and encoder of each field.
 */
export function getStructEncoder<const TFields extends Fields<FixedSizeEncoder<any>>>(
    fields: TFields,
): FixedSizeEncoder<GetEncoderTypeFromFields<TFields>>;
export function getStructEncoder<const TFields extends Fields<Encoder<any>>>(
    fields: TFields,
): VariableSizeEncoder<GetEncoderTypeFromFields<TFields>>;
export function getStructEncoder<const TFields extends Fields<Encoder<any>>>(
    fields: TFields,
): Encoder<GetEncoderTypeFromFields<TFields>> {
    type TFrom = GetEncoderTypeFromFields<TFields>;
    const fieldCodecs = fields.map(([, codec]) => codec);
    const fixedSize = sumCodecSizes(fieldCodecs.map(getFixedSize));
    const maxSize = sumCodecSizes(fieldCodecs.map(getMaxSize)) ?? undefined;

    return createEncoder({
        ...(fixedSize === null
            ? {
                  getSizeFromValue: (value: TFrom) =>
                      fields
                          .map(([key, codec]) => getEncodedSize(value[key as keyof TFrom], codec))
                          .reduce((all, one) => all + one, 0),
                  maxSize,
              }
            : { fixedSize }),
        write: (struct: TFrom, bytes, offset) => {
            fields.forEach(([key, codec]) => {
                offset = codec.write(struct[key as keyof TFrom], bytes, offset);
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
export function getStructDecoder<const TFields extends Fields<FixedSizeDecoder<any>>>(
    fields: TFields,
): FixedSizeDecoder<GetDecoderTypeFromFields<TFields>>;
export function getStructDecoder<const TFields extends Fields<Decoder<any>>>(
    fields: TFields,
): VariableSizeDecoder<GetDecoderTypeFromFields<TFields>>;
export function getStructDecoder<const TFields extends Fields<Decoder<any>>>(
    fields: TFields,
): Decoder<GetDecoderTypeFromFields<TFields>> {
    type TTo = GetDecoderTypeFromFields<TFields>;
    const fieldCodecs = fields.map(([, codec]) => codec);
    const fixedSize = sumCodecSizes(fieldCodecs.map(getFixedSize));
    const maxSize = sumCodecSizes(fieldCodecs.map(getMaxSize)) ?? undefined;

    return createDecoder({
        ...(fixedSize === null ? { maxSize } : { fixedSize }),
        read: (bytes: ReadonlyUint8Array | Uint8Array, offset) => {
            const struct = {} as TTo;
            fields.forEach(([key, codec]) => {
                const [value, newOffset] = codec.read(bytes, offset);
                offset = newOffset;
                struct[key as keyof TTo] = value;
            });
            return [struct, offset];
        },
    });
}

/**
 * Creates a codec for a custom object.
 *
 * @param fields - The name and codec of each field.
 */
export function getStructCodec<const TFields extends Fields<FixedSizeCodec<any>>>(
    fields: TFields,
): FixedSizeCodec<
    GetEncoderTypeFromFields<TFields>,
    GetDecoderTypeFromFields<TFields> & GetEncoderTypeFromFields<TFields>
>;
export function getStructCodec<const TFields extends Fields<Codec<any>>>(
    fields: TFields,
): VariableSizeCodec<
    GetEncoderTypeFromFields<TFields>,
    GetDecoderTypeFromFields<TFields> & GetEncoderTypeFromFields<TFields>
>;
export function getStructCodec<const TFields extends Fields<Codec<any>>>(
    fields: TFields,
): Codec<GetEncoderTypeFromFields<TFields>, GetDecoderTypeFromFields<TFields> & GetEncoderTypeFromFields<TFields>> {
    return combineCodec(
        getStructEncoder(fields),
        getStructDecoder(fields) as Decoder<GetDecoderTypeFromFields<TFields> & GetEncoderTypeFromFields<TFields>>,
    );
}
