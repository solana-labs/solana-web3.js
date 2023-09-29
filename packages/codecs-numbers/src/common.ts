import { BaseCodecOptions, Codec, Decoder, Encoder } from '@solana/codecs-core';

/** Defines a encoder for numbers and bigints. */
export type NumberEncoder = Encoder<number> | Encoder<number | bigint>;

/** Defines a decoder for numbers and bigints. */
export type NumberDecoder = Decoder<number> | Decoder<bigint>;

/** Defines a codec for numbers and bigints. */
export type NumberCodec = Codec<number> | Codec<number | bigint, bigint>;

/** Defines the options for u8 and i8 codecs. */
export type SingleByteNumberCodecOptions = BaseCodecOptions;

/** Defines the options for number codecs that use more than one byte. */
export type NumberCodecOptions = BaseCodecOptions & {
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
