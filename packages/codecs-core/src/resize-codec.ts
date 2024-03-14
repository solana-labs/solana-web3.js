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

/**
 * Updates the size of a given encoder.
 */
export function resizeEncoder<TFrom, TSize extends number, TNewSize extends number>(
    encoder: FixedSizeEncoder<TFrom, TSize>,
    resize: (size: TSize) => TNewSize,
): FixedSizeEncoder<TFrom, TNewSize>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resizeEncoder<TEncoder extends Encoder<any>>(
    encoder: TEncoder,
    resize: (size: number) => number,
): TEncoder;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resizeEncoder<TEncoder extends Encoder<any>>(
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any

export function resizeDecoder<TFrom, TSize extends number, TNewSize extends number>(
    decoder: FixedSizeDecoder<TFrom, TSize>,
    resize: (size: TSize) => TNewSize,
): FixedSizeDecoder<TFrom, TNewSize>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resizeDecoder<TDecoder extends Decoder<any>>(
    decoder: TDecoder,
    resize: (size: number) => number,
): TDecoder;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resizeDecoder<TDecoder extends Decoder<any>>(
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resizeCodec<TFrom, TTo extends TFrom, TSize extends number, TNewSize extends number>(
    codec: FixedSizeCodec<TFrom, TTo, TSize>,
    resize: (size: TSize) => TNewSize,
): FixedSizeCodec<TFrom, TTo, TNewSize>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resizeCodec<TCodec extends Codec<any>>(codec: TCodec, resize: (size: number) => number): TCodec;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function resizeCodec<TCodec extends Codec<any>>(codec: TCodec, resize: (size: number) => number): TCodec {
    return combineCodec(resizeEncoder(codec, resize), resizeDecoder(codec, resize)) as TCodec;
}
