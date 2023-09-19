import { BaseCodecOptions, Codec } from '@solana/codecs-core';

/**
 * Defines a serializer for numbers and bigints.
 */
export type NumberCodec = Codec<number> | Codec<number | bigint, bigint>;

/**
 * Defines the options for u8 and i8 serializers.
 */
export type SingleByteNumberCodecOptions = BaseCodecOptions;

/**
 * Defines the options for number serializers that use more than one byte.
 */
export type NumberCodecOptions = BaseCodecOptions & {
    /**
     * Whether the serializer should use little-endian or big-endian encoding.
     * @defaultValue `Endian.Little`
     */
    endian?: Endian;
};

/**
 * Defines the endianness of a number serializer.
 */
export enum Endian {
    Little = 'le',
    Big = 'be',
}
