import { getU8Codec } from '@solana/codecs-numbers';
import { SOLANA_ERROR__CODECS__INVALID_BYTE_LENGTH, SolanaError } from '@solana/errors';

import { getBytesCodec } from '../bytes.js';
import { b } from './__setup__.js';

describe('getBytesCodec', () => {
    const bytes = getBytesCodec;
    const u8 = getU8Codec;

    it('encodes prefixed bytes', () => {
        const bytesU8 = bytes({ size: u8() });

        expect(bytesU8.encode(new Uint8Array([42, 3]))).toStrictEqual(b('022a03'));
        expect(bytesU8.read(b('022a03ffff'), 0)).toStrictEqual([new Uint8Array([42, 3]), 3]);
        expect(bytesU8.read(b('ff022a03ffff'), 1)).toStrictEqual([new Uint8Array([42, 3]), 4]);

        // Not enough bytes.
        expect(() => bytesU8.read(b('022a'), 0)).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__INVALID_BYTE_LENGTH, {
                bytesLength: 1,
                codecDescription: 'bytes',
                expected: 2,
            }),
        );
    });

    it('encodes fixed bytes', () => {
        const bytes2 = bytes({ size: 2 });
        const bytes5 = bytes({ size: 5 });

        // Exact size.
        expect(bytes2.encode(new Uint8Array([1, 2]))).toStrictEqual(b('0102'));
        expect(bytes2.read(b('0102'), 0)).toStrictEqual([new Uint8Array([1, 2]), 2]);
        expect(bytes2.read(b('ff0102'), 1)).toStrictEqual([new Uint8Array([1, 2]), 3]);

        // Too small (padded).
        expect(bytes5.encode(new Uint8Array([1, 2]))).toStrictEqual(b('0102000000'));
        expect(bytes5.read(b('0102000000'), 0)).toStrictEqual([new Uint8Array([1, 2, 0, 0, 0]), 5]);
        expect(bytes5.read(b('ff0102000000'), 1)).toStrictEqual([new Uint8Array([1, 2, 0, 0, 0]), 6]);
        expect(() => bytes5.read(b('0102'), 0)).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__INVALID_BYTE_LENGTH, {
                bytesLength: 2,
                codecDescription: 'fixCodec',
                expected: 5,
            }),
        );

        // Too large (truncated).
        expect(bytes2.encode(new Uint8Array([1, 2, 3, 4, 5]))).toStrictEqual(b('0102'));
        expect(bytes2.read(b('0102030405'), 0)).toStrictEqual([new Uint8Array([1, 2]), 2]);
        expect(bytes2.read(b('ff0102030405'), 1)).toStrictEqual([new Uint8Array([1, 2]), 3]);
    });

    it('encodes variable bytes', () => {
        expect(bytes().encode(new Uint8Array([]))).toStrictEqual(b(''));
        expect(bytes().read(b(''), 0)).toStrictEqual([new Uint8Array([]), 0]);

        expect(bytes().encode(new Uint8Array([0]))).toStrictEqual(b('00'));
        expect(bytes().read(b('00'), 0)).toStrictEqual([new Uint8Array([0]), 1]);

        expect(bytes().encode(new Uint8Array([42, 255]))).toStrictEqual(b('2aff'));
        expect(bytes().read(b('2aff'), 0)).toStrictEqual([new Uint8Array([42, 255]), 2]);
        expect(bytes().read(b('ff2aff'), 1)).toStrictEqual([new Uint8Array([42, 255]), 3]);
    });

    it('has the right sizes', () => {
        expect(bytes({ size: 42 }).fixedSize).toBe(42);
        expect(bytes().getSizeFromValue(new Uint8Array(42))).toBe(42);
        expect(bytes().maxSize).toBeUndefined();
        expect(bytes({ size: 'variable' }).getSizeFromValue(new Uint8Array(42))).toBe(42);
        expect(bytes({ size: 'variable' }).maxSize).toBeUndefined();
        expect(bytes({ size: u8() }).getSizeFromValue(new Uint8Array(42))).toBe(1 + 42);
        expect(bytes({ size: u8() }).maxSize).toBeUndefined();
    });
});
