import { Codec, Decoder, Encoder, FixedSizeCodec, FixedSizeDecoder, FixedSizeEncoder } from '@solana/codecs-core';

/** Defines a encoder for numbers and bigints. */
export type NumberEncoder = Encoder<bigint | number> | Encoder<number>;

/** Defines a fixed-size encoder for numbers and bigints. */
export type FixedSizeNumberEncoder<TSize extends number = number> =
    | FixedSizeEncoder<bigint | number, TSize>
    | FixedSizeEncoder<number, TSize>;

/** Defines a decoder for numbers and bigints. */
export type NumberDecoder = Decoder<bigint> | Decoder<number>;

/** Defines a fixed-size decoder for numbers and bigints. */
export type FixedSizeNumberDecoder<TSize extends number = number> =
    | FixedSizeDecoder<bigint, TSize>
    | FixedSizeDecoder<number, TSize>;

/** Defines a codec for numbers and bigints. */
export type NumberCodec = Codec<bigint | number, bigint> | Codec<number>;

/** Defines a fixed-size codec for numbers and bigints. */
export type FixedSizeNumberCodec<TSize extends number = number> =
    | FixedSizeCodec<bigint | number, bigint, TSize>
    | FixedSizeCodec<number, number, TSize>;

/** Defines the config for number codecs that use more than one byte. */
export type NumberCodecConfig = {
    /**
     * Whether the serializer should use little-endian or big-endian encoding.
     * @defaultValue `Endian.Little`
     */
    endian?: Endian;
};

/** Defines the endianness of a number serializer. */
export enum Endian {
    Little,
    Big,
}
