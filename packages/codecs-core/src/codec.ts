/**
 * Defines an offset in bytes.
 */
export type Offset = number;

/**
 * The shared attributes between codecs, encoders and decoders.
 */
export type CodecData = {
    /** A description for the codec. */
    description: string;
    /** The fixed size of the encoded value in bytes, or `null` if it is variable. */
    fixedSize: number | null;
    /** The maximum size an encoded value can be in bytes, or `null` if it is variable. */
    maxSize: number | null;
};

/**
 * An object that can encode a value to a `Uint8Array`.
 */
export type Encoder<T> = CodecData & {
    /** The function that encodes a value into bytes. */
    encode: (value: T) => Uint8Array;
};

/**
 * An object that can decode a value from a `Uint8Array`.
 */
export type Decoder<T> = CodecData & {
    /**
     * The function that decodes a value from bytes.
     * It returns the decoded value and the number of bytes read.
     */
    decode: (bytes: Uint8Array, offset?: Offset) => [T, Offset];
};

/**
 * An object that can encode and decode a value to and from a `Uint8Array`.
 * It supports encoding looser types than it decodes for convenience.
 * For example, a `bigint` encoder will always decode to a `bigint`
 * but can be used to encode a `number`.
 *
 * @typeParam From - The type of the value to encode.
 * @typeParam To - The type of the decoded value. Defaults to `From`.
 */
export type Codec<From, To extends From = From> = Encoder<From> & Decoder<To>;

/**
 * Defines common options for codec factories.
 */
export type BaseCodecOptions = {
    /** A custom description for the Codec. */
    description?: string;
};

/**
 * Wraps all the attributes of an object in Codecs.
 */
export type WrapInCodec<T, U extends T = T> = {
    [P in keyof T]: Codec<T[P], U[P]>;
};
