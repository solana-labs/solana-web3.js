import {
    SOLANA_ERROR__CODECS__ENCODED_BYTES_MUST_NOT_INCLUDE_SENTINEL,
    SOLANA_ERROR__CODECS__SENTINEL_MISSING_IN_DECODED_BYTES,
    SolanaError,
} from '@solana/errors';

import { containsBytes } from './bytes';
import {
    Codec,
    createDecoder,
    createEncoder,
    Decoder,
    Encoder,
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    isFixedSize,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from './codec';
import { combineCodec } from './combine-codec';
import { ReadonlyUint8Array } from './readonly-uint8array';

/**
 * Creates an encoder that writes a `Uint8Array` sentinel after the encoded value.
 * This is useful to delimit the encoded value when being read by a decoder.
 *
 * Note that, if the sentinel is found in the encoded value, an error is thrown.
 */
export function addEncoderSentinel<TFrom>(
    encoder: FixedSizeEncoder<TFrom>,
    sentinel: ReadonlyUint8Array,
): FixedSizeEncoder<TFrom>;
export function addEncoderSentinel<TFrom>(
    encoder: Encoder<TFrom>,
    sentinel: ReadonlyUint8Array,
): VariableSizeEncoder<TFrom>;
export function addEncoderSentinel<TFrom>(encoder: Encoder<TFrom>, sentinel: ReadonlyUint8Array): Encoder<TFrom> {
    const write = ((value, bytes, offset) => {
        // Here we exceptionally use the `encode` function instead of the `write`
        // function to contain the content of the encoder within its own bounds
        // and to avoid writing the sentinel as part of the encoded value.
        const encoderBytes = encoder.encode(value);
        if (findSentinelIndex(encoderBytes, sentinel) >= 0) {
            throw new SolanaError(SOLANA_ERROR__CODECS__ENCODED_BYTES_MUST_NOT_INCLUDE_SENTINEL, {
                encodedBytes: encoderBytes,
                hexEncodedBytes: hexBytes(encoderBytes),
                hexSentinel: hexBytes(sentinel),
                sentinel,
            });
        }
        bytes.set(encoderBytes, offset);
        offset += encoderBytes.length;
        bytes.set(sentinel, offset);
        offset += sentinel.length;
        return offset;
    }) as Encoder<TFrom>['write'];

    if (isFixedSize(encoder)) {
        return createEncoder({ ...encoder, fixedSize: encoder.fixedSize + sentinel.length, write });
    }

    return createEncoder({
        ...encoder,
        ...(encoder.maxSize != null ? { maxSize: encoder.maxSize + sentinel.length } : {}),
        getSizeFromValue: value => encoder.getSizeFromValue(value) + sentinel.length,
        write,
    });
}

/**
 * Creates a decoder that continues reading until a `Uint8Array` sentinel is found.
 *
 * If the sentinel is not found in the byte array to decode, an error is thrown.
 */
export function addDecoderSentinel<TTo>(
    decoder: FixedSizeDecoder<TTo>,
    sentinel: ReadonlyUint8Array,
): FixedSizeDecoder<TTo>;
export function addDecoderSentinel<TTo>(decoder: Decoder<TTo>, sentinel: ReadonlyUint8Array): VariableSizeDecoder<TTo>;
export function addDecoderSentinel<TTo>(decoder: Decoder<TTo>, sentinel: ReadonlyUint8Array): Decoder<TTo> {
    const read = ((bytes, offset) => {
        const candidateBytes = offset === 0 ? bytes : bytes.slice(offset);
        const sentinelIndex = findSentinelIndex(candidateBytes, sentinel);
        if (sentinelIndex === -1) {
            throw new SolanaError(SOLANA_ERROR__CODECS__SENTINEL_MISSING_IN_DECODED_BYTES, {
                decodedBytes: candidateBytes,
                hexDecodedBytes: hexBytes(candidateBytes),
                hexSentinel: hexBytes(sentinel),
                sentinel,
            });
        }
        const preSentinelBytes = candidateBytes.slice(0, sentinelIndex);
        // Here we exceptionally use the `decode` function instead of the `read`
        // function to contain the content of the decoder within its own bounds
        // and ensure that the sentinel is not part of the decoded value.
        return [decoder.decode(preSentinelBytes), offset + preSentinelBytes.length + sentinel.length];
    }) as Decoder<TTo>['read'];

    if (isFixedSize(decoder)) {
        return createDecoder({ ...decoder, fixedSize: decoder.fixedSize + sentinel.length, read });
    }

    return createDecoder({
        ...decoder,
        ...(decoder.maxSize != null ? { maxSize: decoder.maxSize + sentinel.length } : {}),
        read,
    });
}

/**
 * Creates a Codec that writes a `Uint8Array` sentinel after the encoded
 * value and, when decoding, continues reading until the sentinel is found.
 *
 * Note that, if the sentinel is found in the encoded value
 * or not found in the byte array to decode, an error is thrown.
 */
export function addCodecSentinel<TFrom, TTo extends TFrom>(
    codec: FixedSizeCodec<TFrom, TTo>,
    sentinel: ReadonlyUint8Array,
): FixedSizeCodec<TFrom, TTo>;
export function addCodecSentinel<TFrom, TTo extends TFrom>(
    codec: Codec<TFrom, TTo>,
    sentinel: ReadonlyUint8Array,
): VariableSizeCodec<TFrom, TTo>;
export function addCodecSentinel<TFrom, TTo extends TFrom>(
    codec: Codec<TFrom, TTo>,
    sentinel: ReadonlyUint8Array,
): Codec<TFrom, TTo> {
    return combineCodec(addEncoderSentinel(codec, sentinel), addDecoderSentinel(codec, sentinel));
}

function findSentinelIndex(bytes: ReadonlyUint8Array, sentinel: ReadonlyUint8Array) {
    return bytes.findIndex((byte, index, arr) => {
        if (sentinel.length === 1) return byte === sentinel[0];
        return containsBytes(arr, sentinel, index);
    });
}

function hexBytes(bytes: ReadonlyUint8Array): string {
    return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
}
