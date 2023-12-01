/**
 * Defines an offset in bytes.
 */
export type Offset = number;

type BaseEncoder<T> = {
    /** Encode the provided value and return the encoded bytes directly. */
    readonly encode: (value: T) => Uint8Array;
    /**
     * Writes the encoded value into the provided byte array at the given offset.
     * Returns the offset of the next byte after the encoded value.
     */
    readonly write: (value: T, bytes: Uint8Array, offset: Offset) => Offset;
};

export type FixedSizeEncoder<T> = BaseEncoder<T> & {
    /** The fixed size of the encoded value in bytes. */
    readonly fixedSize: number;
};

export type VariableSizeEncoder<T> = BaseEncoder<T> & {
    /** A null fixedSize indicates it's a variable size encoder. */
    readonly fixedSize: null;
    /** The maximum size an encoded value can be in bytes, if applicable. */
    readonly maxSize?: number;
    /** The total size of the encoded value in bytes. */
    readonly getSizeFromValue: (value: T) => number;
};

/**
 * An object that can encode a value to a `Uint8Array`.
 */
export type Encoder<T> = FixedSizeEncoder<T> | VariableSizeEncoder<T>;

type BaseDecoder<T> = {
    /** Decodes the provided byte array at the given offset (or zero) and returns the value directly. */
    readonly decode: (bytes: Uint8Array, offset?: Offset) => T;
    /**
     * Reads the encoded value from the provided byte array at the given offset.
     * Returns the decoded value and the offset of the next byte after the encoded value.
     */
    readonly read: (bytes: Uint8Array, offset: Offset) => [T, Offset];
};

export type FixedSizeDecoder<T> = BaseDecoder<T> & {
    /** The fixed size of the encoded value in bytes. */
    readonly fixedSize: number;
};

export type VariableSizeDecoder<T> = BaseDecoder<T> & {
    /** A null fixedSize indicates it's a variable size decoder. */
    readonly fixedSize: null;
    /** The maximum size an encoded value can be in bytes, if applicable. */
    readonly maxSize?: number;
};

/**
 * An object that can decode a value from a `Uint8Array`.
 */
export type Decoder<T> = FixedSizeDecoder<T> | VariableSizeDecoder<T>;

export type FixedSizeCodec<From, To extends From = From> = FixedSizeEncoder<From> & FixedSizeDecoder<To>;

export type VariableSizeCodec<From, To extends From = From> = VariableSizeEncoder<From> & VariableSizeDecoder<To>;

/**
 * An object that can encode and decode a value to and from a `Uint8Array`.
 * It supports encoding looser types than it decodes for convenience.
 * For example, a `bigint` encoder will always decode to a `bigint`
 * but can be used to encode a `number`.
 *
 * @typeParam From - The type of the value to encode.
 * @typeParam To - The type of the decoded value. Defaults to `From`.
 */
export type Codec<From, To extends From = From> = FixedSizeCodec<From, To> | VariableSizeCodec<From, To>;

/**
 * Get the encoded size of a given value in bytes.
 */
export function getEncodedSize<T>(
    value: T,
    encoder: { fixedSize: number } | { fixedSize: null; getSizeFromValue: (value: T) => number }
): number {
    return encoder.fixedSize !== null ? encoder.fixedSize : encoder.getSizeFromValue(value);
}

/** Fills the missing `encode` function using the existing `write` function. */

export function createEncoder<T>(encoder: Omit<FixedSizeEncoder<T>, 'encode'>): FixedSizeEncoder<T>;
export function createEncoder<T>(encoder: Omit<VariableSizeEncoder<T>, 'encode'>): VariableSizeEncoder<T>;
export function createEncoder<T>(
    encoder: Omit<FixedSizeEncoder<T>, 'encode'> | Omit<VariableSizeEncoder<T>, 'encode'>
): Encoder<T>;
export function createEncoder<T>(
    encoder: Omit<FixedSizeEncoder<T>, 'encode'> | Omit<VariableSizeEncoder<T>, 'encode'>
): Encoder<T> {
    return Object.freeze({
        ...encoder,
        encode: (value: T) => {
            const bytes = new Uint8Array(getEncodedSize(value, encoder));
            encoder.write(value, bytes, 0);
            return bytes;
        },
        write: encoder.write,
    });
}

/** Fills the missing `decode` function using the existing `read` function. */
export function createDecoder<T>(decoder: Omit<FixedSizeDecoder<T>, 'decode'>): FixedSizeDecoder<T>;
export function createDecoder<T>(decoder: Omit<VariableSizeDecoder<T>, 'decode'>): VariableSizeDecoder<T>;
export function createDecoder<T>(
    decoder: Omit<FixedSizeDecoder<T>, 'decode'> | Omit<VariableSizeDecoder<T>, 'decode'>
): Decoder<T>;
export function createDecoder<T>(
    decoder: Omit<FixedSizeDecoder<T>, 'decode'> | Omit<VariableSizeDecoder<T>, 'decode'>
): Decoder<T> {
    return Object.freeze({
        ...decoder,
        decode: (bytes: Uint8Array, offset?: Offset) => decoder.read(bytes, offset ?? 0)[0],
        read: decoder.read,
    });
}

/** Fills the missing `encode` and `decode` function using the existing `write` and `read` functions. */
export function createCodec<From, To extends From = From>(
    codec: Omit<FixedSizeCodec<From, To>, 'encode' | 'decode'>
): FixedSizeCodec<From, To>;
export function createCodec<From, To extends From = From>(
    codec: Omit<VariableSizeCodec<From, To>, 'encode' | 'decode'>
): VariableSizeCodec<From, To>;
export function createCodec<From, To extends From = From>(
    codec: Omit<FixedSizeCodec<From, To>, 'encode' | 'decode'> | Omit<VariableSizeCodec<From, To>, 'encode' | 'decode'>
): Codec<From, To>;
export function createCodec<From, To extends From = From>(
    codec: Omit<FixedSizeCodec<From, To>, 'encode' | 'decode'> | Omit<VariableSizeCodec<From, To>, 'encode' | 'decode'>
): Codec<From, To> {
    return Object.freeze({
        ...codec,
        decode: (bytes: Uint8Array, offset?: Offset) => codec.read(bytes, offset ?? 0)[0],
        encode: (value: From) => {
            const bytes = new Uint8Array(getEncodedSize(value, codec));
            codec.write(value, bytes, 0);
            return bytes;
        },
        read: codec.read,
        write: codec.write,
    });
}
