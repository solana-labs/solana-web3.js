import { Endian, getU8Codec, getU16Codec } from '@solana/codecs-numbers';

import { getBytesCodec } from '../bytes';
import { b } from './__setup__';

describe('getBytesCodec', () => {
    const bytes = getBytesCodec;
    const u8 = getU8Codec;
    const u16 = getU16Codec;

    it('encodes prefixed bytes', () => {
        const bytesU8 = bytes({ size: u8() });

        expect(bytesU8.encode(new Uint8Array([42, 3]))).toStrictEqual(b('022a03'));
        expect(bytesU8.decode(b('022a03ffff'))).toStrictEqual([new Uint8Array([42, 3]), 3]);
        expect(bytesU8.decode(b('ff022a03ffff'), 1)).toStrictEqual([new Uint8Array([42, 3]), 4]);

        // Not enough bytes.
        expect(() => bytesU8.decode(b('022a'))).toThrow('Codec [bytes] expected 2 bytes, got 1.');
    });

    it('encodes fixed bytes', () => {
        const bytes2 = bytes({ size: 2 });
        const bytes5 = bytes({ size: 5 });

        // Exact size.
        expect(bytes2.encode(new Uint8Array([1, 2]))).toStrictEqual(b('0102'));
        expect(bytes2.decode(b('0102'))).toStrictEqual([new Uint8Array([1, 2]), 2]);
        expect(bytes2.decode(b('ff0102'), 1)).toStrictEqual([new Uint8Array([1, 2]), 3]);

        // Too small (padded).
        expect(bytes5.encode(new Uint8Array([1, 2]))).toStrictEqual(b('0102000000'));
        expect(bytes5.decode(b('0102000000'))).toStrictEqual([new Uint8Array([1, 2, 0, 0, 0]), 5]);
        expect(bytes5.decode(b('ff0102000000'), 1)).toStrictEqual([new Uint8Array([1, 2, 0, 0, 0]), 6]);
        expect(() => bytes5.decode(b('0102'))).toThrow('Codec [fixCodec] expected 5 bytes, got 2.');

        // Too large (truncated).
        expect(bytes2.encode(new Uint8Array([1, 2, 3, 4, 5]))).toStrictEqual(b('0102'));
        expect(bytes2.decode(b('0102030405'))).toStrictEqual([new Uint8Array([1, 2]), 2]);
        expect(bytes2.decode(b('ff0102030405'), 1)).toStrictEqual([new Uint8Array([1, 2]), 3]);
    });

    it('encodes variable bytes', () => {
        expect(bytes().encode(new Uint8Array([]))).toStrictEqual(b(''));
        expect(bytes().decode(b(''))).toStrictEqual([new Uint8Array([]), 0]);

        expect(bytes().encode(new Uint8Array([0]))).toStrictEqual(b('00'));
        expect(bytes().decode(b('00'))).toStrictEqual([new Uint8Array([0]), 1]);

        expect(bytes().encode(new Uint8Array([42, 255]))).toStrictEqual(b('2aff'));
        expect(bytes().decode(b('2aff'))).toStrictEqual([new Uint8Array([42, 255]), 2]);
        expect(bytes().decode(b('ff2aff'), 1)).toStrictEqual([new Uint8Array([42, 255]), 3]);
    });

    it('has the right description', () => {
        // Size.
        expect(bytes().description).toBe('bytes(variable)');
        expect(bytes({ size: 42 }).description).toBe('bytes(42)');
        expect(bytes({ size: 'variable' }).description).toBe('bytes(variable)');
        expect(bytes({ size: u16() }).description).toBe('bytes(u16(le))');
        expect(bytes({ size: u16({ endian: Endian.BIG }) }).description).toBe('bytes(u16(be))');

        // Custom.
        expect(bytes({ description: 'My bytes' }).description).toBe('My bytes');
    });

    it('has the right sizes', () => {
        expect(bytes().fixedSize).toBeNull();
        expect(bytes().maxSize).toBeNull();
        expect(bytes({ size: u8() }).fixedSize).toBeNull();
        expect(bytes({ size: u8() }).maxSize).toBeNull();
        expect(bytes({ size: 'variable' }).fixedSize).toBeNull();
        expect(bytes({ size: 'variable' }).maxSize).toBeNull();
        expect(bytes({ size: 42 }).fixedSize).toBe(42);
        expect(bytes({ size: 42 }).maxSize).toBe(42);
    });
});
