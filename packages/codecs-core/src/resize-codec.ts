import { SOLANA_ERROR__CODECS__EXPECTED_POSITIVE_BYTE_LENGTH, SolanaError } from '@solana/errors';

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
} from './codec';
import { combineCodec } from './combine-codec';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEncoder = Encoder<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDecoder = Decoder<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyCodec = Codec<any>;

/**
 * Updates the size of a given encoder.
 */
export function resizeEncoder<TFrom, TSize extends number, TNewSize extends number>(
    encoder: FixedSizeEncoder<TFrom, TSize>,
    resize: (size: TSize) => TNewSize,
): FixedSizeEncoder<TFrom, TNewSize>;
export function resizeEncoder<TEncoder extends AnyEncoder>(
    encoder: TEncoder,
    resize: (size: number) => number,
): TEncoder;
export function resizeEncoder<TEncoder extends AnyEncoder>(
    encoder: TEncoder,
    resize: (size: number) => number,
): TEncoder {
    if (isFixedSize(encoder)) {
        const fixedSize = resize(encoder.fixedSize);
        if (fixedSize < 0) {
            throw new SolanaError(SOLANA_ERROR__CODECS__EXPECTED_POSITIVE_BYTE_LENGTH, {
                bytesLength: fixedSize,
                codecDescription: 'resizeEncoder',
            });
        }
        return createEncoder({ ...encoder, fixedSize }) as TEncoder;
    }
    return createEncoder({
        ...encoder,
        getSizeFromValue: value => {
            const newSize = resize(encoder.getSizeFromValue(value));
            if (newSize < 0) {
                throw new SolanaError(SOLANA_ERROR__CODECS__EXPECTED_POSITIVE_BYTE_LENGTH, {
                    bytesLength: newSize,
                    codecDescription: 'resizeEncoder',
                });
            }
            return newSize;
        },
    }) as TEncoder;
}

/**
 * Updates the size of a given decoder.
 */

export function resizeDecoder<TFrom, TSize extends number, TNewSize extends number>(
    decoder: FixedSizeDecoder<TFrom, TSize>,
    resize: (size: TSize) => TNewSize,
): FixedSizeDecoder<TFrom, TNewSize>;
export function resizeDecoder<TDecoder extends AnyDecoder>(
    decoder: TDecoder,
    resize: (size: number) => number,
): TDecoder;
export function resizeDecoder<TDecoder extends AnyDecoder>(
    decoder: TDecoder,
    resize: (size: number) => number,
): TDecoder {
    if (isFixedSize(decoder)) {
        const fixedSize = resize(decoder.fixedSize);
        if (fixedSize < 0) {
            throw new SolanaError(SOLANA_ERROR__CODECS__EXPECTED_POSITIVE_BYTE_LENGTH, {
                bytesLength: fixedSize,
                codecDescription: 'resizeDecoder',
            });
        }
        return createDecoder({ ...decoder, fixedSize }) as TDecoder;
    }
    return decoder;
}

/**
 * Updates the size of a given codec.
 */
export function resizeCodec<TFrom, TTo extends TFrom, TSize extends number, TNewSize extends number>(
    codec: FixedSizeCodec<TFrom, TTo, TSize>,
    resize: (size: TSize) => TNewSize,
): FixedSizeCodec<TFrom, TTo, TNewSize>;
export function resizeCodec<TCodec extends AnyCodec>(codec: TCodec, resize: (size: number) => number): TCodec;
export function resizeCodec<TCodec extends AnyCodec>(codec: TCodec, resize: (size: number) => number): TCodec {
    return combineCodec(resizeEncoder(codec, resize), resizeDecoder(codec, resize)) as TCodec;
}
