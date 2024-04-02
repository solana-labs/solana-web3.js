import { addCodecSizePrefix, fixCodecSize, offsetCodec } from '@solana/codecs-core';
import { getU8Codec, getU32Codec } from '@solana/codecs-numbers';

import { getBase16Codec } from '../base16';
import { getBase58Codec } from '../base58';
import { getUtf8Codec } from '../utf8';

describe('sized string encodings', () => {
    const b = (value: string) => getBase16Codec().encode(value);

    it('encodes prefixed strings', () => {
        const u32PrefixedString = addCodecSizePrefix(getUtf8Codec(), getU32Codec());

        // Empty string.
        expect(u32PrefixedString.encode('')).toStrictEqual(b('00000000'));
        expect(u32PrefixedString.decode(b('00000000'))).toBe('');

        // Hello World!
        expect(u32PrefixedString.encode('Hello World!')).toStrictEqual(b('0c00000048656c6c6f20576f726c6421'));
        expect(u32PrefixedString.decode(b('0c00000048656c6c6f20576f726c6421'), 0)).toBe('Hello World!');

        // Characters with different byte lengths.
        expect(u32PrefixedString.encode('語')).toStrictEqual(b('03000000e8aa9e'));
        expect(u32PrefixedString.read(b('03000000e8aa9e'), 0)).toStrictEqual(['語', 7]);
        expect(u32PrefixedString.read(b('ff03000000e8aa9e'), 1)).toStrictEqual(['語', 8]);

        // Different prefix lengths.
        const u8PrefixedString = addCodecSizePrefix(getUtf8Codec(), getU8Codec());
        expect(u8PrefixedString.encode('ABC')).toStrictEqual(b('03414243'));
        expect(u8PrefixedString.decode(b('03414243'))).toBe('ABC');

        // Not enough bytes.
        expect(() => u8PrefixedString.decode(b('0341'))).toThrow();
    });

    it('encodes fixed strings', () => {
        const string5 = fixCodecSize(getUtf8Codec(), 5);
        const string12 = fixCodecSize(getUtf8Codec(), 12);

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
        const variableString = getUtf8Codec();

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
        const prefixedString = addCodecSizePrefix(getBase58Codec(), getU8Codec());
        expect(prefixedString.encode('ABC')).toStrictEqual(b('027893'));
        expect(prefixedString.decode(b('027893'))).toBe('ABC');

        // Fixed.
        const fixedString = fixCodecSize(getBase58Codec(), 5);
        expect(fixedString.encode('ABC')).toStrictEqual(b('7893000000'));
        expect(fixedString.decode(b('7893000000'))).toBe('EbzinYo'); // <- Base58 expect left padding.
        expect(fixedString.decode(b('0000007893'))).toBe('111ABC'); // <- And uses 1s for padding.

        // Variable.
        const variableString = getBase58Codec();
        expect(variableString.encode('ABC')).toStrictEqual(b('7893'));
        expect(variableString.decode(b('7893'))).toBe('ABC');
    });

    it('has the right sizes', () => {
        expect(addCodecSizePrefix(getUtf8Codec(), getU8Codec()).getSizeFromValue('ABC')).toBe(1 + 3);
        expect(addCodecSizePrefix(getUtf8Codec(), getU8Codec()).maxSize).toBeUndefined();
        expect(getUtf8Codec().getSizeFromValue('ABC')).toBe(3);
        expect(getUtf8Codec().maxSize).toBeUndefined();
        expect(fixCodecSize(getUtf8Codec(), 42).fixedSize).toBe(42);
    });

    it('offsets prefixed strings', () => {
        const codec = addCodecSizePrefix(
            getUtf8Codec(),
            offsetCodec(getU8Codec(), {
                postOffset: () => 0,
                preOffset: ({ wrapBytes }) => wrapBytes(-1),
            }),
        );
        expect(codec.encode('ABC')).toStrictEqual(b('41424303'));
        expect(codec.decode(b('41424303'))).toBe('ABC');
    });
});
