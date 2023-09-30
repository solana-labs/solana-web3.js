import { Endian, getU8Codec, getU16Codec } from '@solana/codecs-numbers';

import { getBase16Codec } from '../base16';
import { getBase58Codec } from '../base58';
import { getStringCodec } from '../string';

describe('getStringCodec', () => {
    const string = getStringCodec;
    const u8 = getU8Codec;
    const u16 = getU16Codec;
    const base58 = getBase58Codec;
    const b = (value: string) => getBase16Codec().encode(value);

    it('encodes prefixed strings', () => {
        // Empty string.
        expect(string().encode('')).toStrictEqual(b('00000000'));
        expect(string().decode(b('00000000'))).toStrictEqual(['', 4]);

        // Hello World!
        expect(string().encode('Hello World!')).toStrictEqual(b('0c00000048656c6c6f20576f726c6421'));
        expect(string().decode(b('0c00000048656c6c6f20576f726c6421'))).toStrictEqual(['Hello World!', 4 + 12]);

        // Characters with different byte lengths.
        expect(string().encode('語')).toStrictEqual(b('03000000e8aa9e'));
        expect(string().decode(b('03000000e8aa9e'))).toStrictEqual(['語', 7]);
        expect(string().decode(b('ff03000000e8aa9e'), 1)).toStrictEqual(['語', 8]);

        // Different prefix lengths.
        expect(string({ size: u8() }).encode('ABC')).toStrictEqual(b('03414243'));
        expect(string({ size: u8() }).decode(b('03414243'))).toStrictEqual(['ABC', 1 + 3]);

        // Not enough bytes.
        expect(() => string({ size: u8() }).decode(b('0341'))).toThrow('Codec [string] expected 3 bytes, got 1.');
    });

    it('encodes fixed strings', () => {
        const string5 = string({ size: 5 });
        const string12 = string({ size: 12 });

        // Hello World! (exact size).
        expect(string12.encode('Hello World!')).toStrictEqual(b('48656c6c6f20576f726c6421'));
        expect(string12.decode(b('48656c6c6f20576f726c6421'))).toStrictEqual(['Hello World!', 12]);

        // Empty string (padded).
        expect(string5.encode('')).toStrictEqual(b('0000000000'));
        expect(string5.decode(b('0000000000'))).toStrictEqual(['', 5]);

        // Characters with different byte lengths (padded).
        expect(string5.encode('語')).toStrictEqual(b('e8aa9e0000'));
        expect(string5.decode(b('e8aa9e0000'))).toStrictEqual(['語', 5]);

        // Hello World! (truncated).
        expect(string5.encode('Hello World!')).toStrictEqual(b('48656c6c6f'));
        expect(string5.decode(b('48656c6c6f'))).toStrictEqual(['Hello', 5]);
    });

    it('encodes variable strings', () => {
        const variableString = string({ size: 'variable' });

        // Empty string.
        expect(variableString.encode('')).toStrictEqual(b(''));
        expect(variableString.decode(b(''))).toStrictEqual(['', 0]);

        // Hello World!
        expect(variableString.encode('Hello World!')).toStrictEqual(b('48656c6c6f20576f726c6421'));
        expect(variableString.decode(b('48656c6c6f20576f726c6421'))).toStrictEqual(['Hello World!', 12]);

        // Characters with different byte lengths.
        expect(variableString.encode('語')).toStrictEqual(b('e8aa9e'));
        expect(variableString.decode(b('e8aa9e'))).toStrictEqual(['語', 3]);
    });

    it('encodes strings using custom encodings', () => {
        // Prefixed.
        const prefixedString = string({ encoding: base58(), size: u8() });
        expect(prefixedString.encode('ABC')).toStrictEqual(b('027893'));
        expect(prefixedString.decode(b('027893'))).toStrictEqual(['ABC', 1 + 2]);

        // Fixed.
        const fixedString = string({ encoding: base58(), size: 5 });
        expect(fixedString.encode('ABC')).toStrictEqual(b('7893000000'));
        expect(fixedString.decode(b('7893000000'))).toStrictEqual(['EbzinYo', 5]); // <- Base58 expect left padding.
        expect(fixedString.decode(b('0000007893'))).toStrictEqual(['111ABC', 5]); // <- And uses 1s for padding.

        // Variable.
        const variableString = string({ encoding: base58(), size: 'variable' });
        expect(variableString.encode('ABC')).toStrictEqual(b('7893'));
        expect(variableString.decode(b('7893'))).toStrictEqual(['ABC', 2]);
    });

    it('has the right description', () => {
        // Encoding.
        expect(string().description).toBe('string(utf8; u32(le))');
        expect(string({ encoding: base58() }).description).toBe('string(base58; u32(le))');

        // Size.
        expect(string({ size: 42 }).description).toBe('string(utf8; 42)');
        expect(string({ size: 'variable' }).description).toBe('string(utf8; variable)');
        expect(string({ size: u16() }).description).toBe('string(utf8; u16(le))');
        expect(string({ size: u16({ endian: Endian.BIG }) }).description).toBe('string(utf8; u16(be))');

        // Custom.
        expect(string({ description: 'My custom description' }).description).toBe('My custom description');
    });

    it('has the right sizes', () => {
        expect(string().fixedSize).toBeNull();
        expect(string().maxSize).toBeNull();
        expect(string({ size: u8() }).fixedSize).toBeNull();
        expect(string({ size: u8() }).maxSize).toBeNull();
        expect(string({ size: 'variable' }).fixedSize).toBeNull();
        expect(string({ size: 'variable' }).maxSize).toBeNull();
        expect(string({ size: 42 }).fixedSize).toBe(42);
        expect(string({ size: 42 }).maxSize).toBe(42);
    });
});
