import {
    combineCodec,
    containsBytes,
    createDecoder,
    createEncoder,
    FixedSizeCodec,
    FixedSizeDecoder,
    FixedSizeEncoder,
    ReadonlyUint8Array,
} from '@solana/codecs-core';
import { getBase16Decoder } from '@solana/codecs-strings';
import { SOLANA_ERROR__CODECS__INVALID_CONSTANT, SolanaError } from '@solana/errors';

/**
 * Creates a void encoder that always sets the provided byte array when encoding.
 */
export function getConstantEncoder<TConstant extends ReadonlyUint8Array>(
    constant: TConstant,
): FixedSizeEncoder<void, TConstant['length']> {
    return createEncoder({
        fixedSize: constant.length,
        write: (_, bytes, offset) => {
            bytes.set(constant, offset);
            return offset + constant.length;
        },
    });
}

/**
 * Creates a void decoder that reads the next bytes and fails if they do not match the provided constant.
 */
export function getConstantDecoder<TConstant extends ReadonlyUint8Array>(
    constant: TConstant,
): FixedSizeDecoder<void, TConstant['length']> {
    return createDecoder({
        fixedSize: constant.length,
        read: (bytes, offset) => {
            const base16 = getBase16Decoder();
            if (!containsBytes(bytes, constant, offset)) {
                throw new SolanaError(SOLANA_ERROR__CODECS__INVALID_CONSTANT, {
                    constant,
                    data: bytes,
                    hexConstant: base16.decode(constant),
                    hexData: base16.decode(bytes),
                    offset,
                });
            }
            return [undefined, offset + constant.length];
        },
    });
}

/**
 * Creates a void codec that always sets the provided byte array
 * when encoding and, when decoding, asserts that the next
 * bytes match the provided byte array.
 */
export function getConstantCodec<TConstant extends ReadonlyUint8Array>(
    constant: TConstant,
): FixedSizeCodec<void, void, TConstant['length']> {
    return combineCodec(getConstantEncoder(constant), getConstantDecoder(constant));
}
