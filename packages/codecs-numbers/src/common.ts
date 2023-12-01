import { Codec, Decoder, Encoder, FixedSizeCodec, FixedSizeDecoder, FixedSizeEncoder } from '@solana/codecs-core';

/** Defines a encoder for numbers and bigints. */
export type NumberEncoder = Encoder<number> | Encoder<number | bigint>;

/** Defines a fixed-size encoder for numbers and bigints. */
export type FixedSizeNumberEncoder<TSize extends number = number> =
    | FixedSizeEncoder<number, TSize>
    | FixedSizeEncoder<number | bigint, TSize>;

/** Defines a decoder for numbers and bigints. */
export type NumberDecoder = Decoder<number> | Decoder<bigint>;

/** Defines a fixed-size decoder for numbers and bigints. */
export type FixedSizeNumberDecoder<TSize extends number = number> =
    | FixedSizeDecoder<number, TSize>
    | FixedSizeDecoder<bigint, TSize>;

/** Defines a codec for numbers and bigints. */
export type NumberCodec = Codec<number> | Codec<number | bigint, bigint>;

/** Defines a fixed-size codec for numbers and bigints. */
export type FixedSizeNumberCodec<TSize extends number = number> =
    | FixedSizeCodec<number, number, TSize>
    | FixedSizeCodec<number | bigint, bigint, TSize>;

/** Defines the config for number codecs that use more than one byte. */
export type NumberCodecConfig = {
    /**
     * Whether the serializer should use little-endian or big-endian encoding.
     * @defaultValue `Endian.LITTLE`
     */
    endian?: Endian;
};

/** Defines the endianness of a number serializer. */
export enum Endian {
    LITTLE,
    BIG,
}
