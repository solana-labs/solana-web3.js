import { offsetCodec } from '@solana/codecs-core';
import { getU8Codec } from '@solana/codecs-numbers';

import { getBase16Codec } from '../base16.js';
import { getBase58Codec } from '../base58.js';
import { getStringCodec } from '../string.js';

describe('getStringCodec', () => {
    const string = getStringCodec;
    const u8 = getU8Codec;
    const base58 = getBase58Codec;
    const b = (value: string) => getBase16Codec().encode(value);

    it('encodes prefixed strings', () => {
        // Empty string.
        expect(string().encode('')).toStrictEqual(b('00000000'));
        expect(string().decode(b('00000000'))).toBe('');

        // Hello World!
        expect(string().encode('Hello World!')).toStrictEqual(b('0c00000048656c6c6f20576f726c6421'));
        expect(string().decode(b('0c00000048656c6c6f20576f726c6421'), 0)).toBe('Hello World!');

        // Characters with different byte lengths.
        expect(string().encode('語')).toStrictEqual(b('03000000e8aa9e'));
        expect(string().read(b('03000000e8aa9e'), 0)).toStrictEqual(['語', 7]);
        expect(string().read(b('ff03000000e8aa9e'), 1)).toStrictEqual(['語', 8]);

        // Different prefix lengths.
        expect(string({ size: u8() }).encode('ABC')).toStrictEqual(b('03414243'));
        expect(string({ size: u8() }).decode(b('03414243'))).toBe('ABC');

        // Not enough bytes.
        expect(() => string({ size: u8() }).decode(b('0341'))).toThrow(); // `SolanaError` added in later commit
    });

    it('encodes fixed strings', () => {
        const string5 = string({ size: 5 });
        const string12 = string({ size: 12 });

        // Hello World! (exact size).
        expect(string12.encode('Hello World!')).toStrictEqual(b('48656c6c6f20576f726c6421'));
        expect(string12.read(b('48656c6c6f20576f726c6421'), 0)).toStrictEqual(['Hello World!', 12]);

        // Empty string (padded).
        expect(string5.encode('')).toStrictEqual(b('0000000000'));
        expect(string5.read(b('0000000000'), 0)).toStrictEqual(['', 5]);

        // Characters with different byte lengths (padded).
        expect(string5.encode('語')).toStrictEqual(b('e8aa9e0000'));
        expect(string5.read(b('e8aa9e0000'), 0)).toStrictEqual(['語', 5]);

        // Hello World! (truncated).
        expect(string5.encode('Hello World!')).toStrictEqual(b('48656c6c6f'));
        expect(string5.read(b('48656c6c6f'), 0)).toStrictEqual(['Hello', 5]);
    });

    it('encodes variable strings', () => {
        const variableString = string({ size: 'variable' });

        // Empty string.
        expect(variableString.encode('')).toStrictEqual(b(''));
        expect(variableString.decode(b(''))).toBe('');

        // Hello World!
        expect(variableString.encode('Hello World!')).toStrictEqual(b('48656c6c6f20576f726c6421'));
        expect(variableString.decode(b('48656c6c6f20576f726c6421'))).toBe('Hello World!');

        // Characters with different byte lengths.
        expect(variableString.encode('語')).toStrictEqual(b('e8aa9e'));
        expect(variableString.decode(b('e8aa9e'))).toBe('語');
    });

    it('encodes strings using custom encodings', () => {
        // Prefixed.
        const prefixedString = string({ encoding: base58(), size: u8() });
        expect(prefixedString.encode('ABC')).toStrictEqual(b('027893'));
        expect(prefixedString.decode(b('027893'))).toBe('ABC');

        // Fixed.
        const fixedString = string({ encoding: base58(), size: 5 });
        expect(fixedString.encode('ABC')).toStrictEqual(b('7893000000'));
        expect(fixedString.decode(b('7893000000'))).toBe('EbzinYo'); // <- Base58 expect left padding.
        expect(fixedString.decode(b('0000007893'))).toBe('111ABC'); // <- And uses 1s for padding.

        // Variable.
        const variableString = string({ encoding: base58(), size: 'variable' });
        expect(variableString.encode('ABC')).toStrictEqual(b('7893'));
        expect(variableString.decode(b('7893'))).toBe('ABC');
    });

    it('has the right sizes', () => {
        expect(string().getSizeFromValue('ABC')).toBe(4 + 3);
        expect(string().maxSize).toBeUndefined();
        expect(string({ size: u8() }).getSizeFromValue('ABC')).toBe(1 + 3);
        expect(string({ size: u8() }).maxSize).toBeUndefined();
        expect(string({ size: 'variable' }).getSizeFromValue('ABC')).toBe(3);
        expect(string({ size: 'variable' }).maxSize).toBeUndefined();
        expect(string({ size: 42 }).fixedSize).toBe(42);
    });

    it('offsets prefixed strings', () => {
        const codec = string({
            size: offsetCodec(u8(), {
                postOffset: () => 0,
                preOffset: ({ wrapBytes }) => wrapBytes(-1),
            }),
        });
        expect(codec.encode('ABC')).toStrictEqual(b('41424303'));
        expect(codec.decode(b('41424303'))).toBe('ABC');
    });
});
