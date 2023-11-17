/**
 * Defines an offset in bytes.
 */
export type Offset = number;

/**
 * The shared attributes between codecs, encoders and decoders.
 */
export type CodecData = {
    /** An optional description for the codec. */
    description?: string;
    /** The fixed size of the encoded value in bytes, or `null` if it is variable. */
    fixedSize: number | null;
    /** The maximum size an encoded value can be in bytes, or `null` if it is variable. */
    maxSize: number | null;
};

/**
 * An object that can encode a value to a `Uint8Array`.
 */
export type Encoder<T> = CodecData & {
    /** Returns the total size of the encoded value in bytes. */
    getSize: (value: T) => number;

    /**
     * Writes the encoded value into the provided byte array at the given offset.
     * Returns the offset of the next byte after the encoded value.
     */
    write: (value: T, bytes: Uint8Array, offset: Offset) => Offset;

    /** The function that encodes a value into bytes. */
    encode: (value: T) => Uint8Array;
};

/**
 * An object that can decode a value from a `Uint8Array`.
 */
export type Decoder<T> = CodecData & {
    /**
     * Reads the encoded value from the provided byte array at the given offset.
     * Returns the decoded value and the offset of the next byte after the encoded value.
     */
    read: (bytes: Uint8Array, offset: Offset) => [T, Offset];

    /** The function that decodes a value from bytes. */
    decode: (bytes: Uint8Array, offset?: Offset) => T;
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
 * Defines common configurations for codec factories.
 */
export type BaseCodecConfig = {
    /** A custom description for the Codec. */
    description?: string;
};

/**
 * Wraps all the attributes of an object in Codecs.
 */
export type WrapInCodec<T, U extends T = T> = {
    [P in keyof T]: Codec<T[P], U[P]>;
};

type EncoderInput<T> =
    | {
          description?: string;
          fixedSize: number;
          write: Encoder<T>['write'];
      }
    | {
          description?: string;
          maxSize?: number | null;
          getSize: Encoder<T>['getSize'];
          write: Encoder<T>['write'];
      };

/**
 * Fills the `encode` function of an encoder based on the provided `getSize` and `write` functions.
 */
export function createEncoder<T>(encoder: EncoderInput<T>): Encoder<T> {
    return {
        description: encoder.description,
        encode: (value: T): Uint8Array => {
            const size = 'fixedSize' in encoder ? encoder.fixedSize : encoder.getSize(value);
            const bytes = new Uint8Array(size).fill(0);
            encoder.write(value, bytes, 0);
            return bytes;
        },
        fixedSize: 'fixedSize' in encoder ? encoder.fixedSize : null,
        getSize: 'fixedSize' in encoder ? () => encoder.fixedSize : encoder.getSize,
        maxSize: 'fixedSize' in encoder ? encoder.fixedSize : encoder.maxSize ?? null,
        write: encoder.write,
    };
}

type DecoderInput<T> =
    | {
          description?: string;
          fixedSize: number;
          read: Decoder<T>['read'];
      }
    | {
          description?: string;
          fixedSize: null;
          maxSize?: number | null;
          read: Decoder<T>['read'];
      };

/**
 * Fills the `decode` function of a decoder based on the provided `read` function.
 */
export function createDecoder<T>(decoder: DecoderInput<T>): Decoder<T> {
    return {
        decode: (bytes: Uint8Array, offset = 0): T => decoder.read(bytes, offset)[0],
        description: decoder.description,
        fixedSize: decoder.fixedSize,
        maxSize: decoder.fixedSize !== null ? decoder.fixedSize : decoder.maxSize ?? null,
        read: decoder.read,
    };
}

type CodecInput<T, U extends T = T> = EncoderInput<T> & {
    read: Decoder<U>['read'];
};

/**
 * Fills the `encode` and `decode` functions of a codec based on the provided `getSize`, `write` and `read` functions.
 */
export function createCodec<T, U extends T = T>(codec: CodecInput<T, U>): Codec<T, U> {
    return {
        ...createEncoder(codec),
        decode: (bytes: Uint8Array, offset = 0): U => codec.read(bytes, offset)[0],
        read: codec.read,
    };
}
