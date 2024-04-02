import { assertIsFixedSize, assertIsVariableSize } from '@solana/codecs-core';
import { getU8Codec } from '@solana/codecs-numbers';
import { getUtf8Codec } from '@solana/codecs-strings';

import { getConstantCodec } from '../constant';
import { getHiddenPrefixCodec } from '../hidden-prefix';
import { b } from './__setup__';

describe('getHiddenPrefixCodec', () => {
    const prefixA = getConstantCodec(b('aa'));
    const prefixB = getConstantCodec(b('bb'));

    it('encodes all prefixes before the main encoder', () => {
        const codec = getHiddenPrefixCodec(getU8Codec(), [prefixA, prefixB]);
        expect(codec.encode(1)).toStrictEqual(b('aabb01'));
    });

    it('decodes only the main decoder', () => {
        const codec = getHiddenPrefixCodec(getU8Codec(), [prefixA, prefixB]);
        expect(codec.decode(b('aabb01'))).toBe(1);
    });

    it('pushes the offset forward when writing', () => {
        const codec = getHiddenPrefixCodec(getU8Codec(), [prefixA, prefixB]);
        expect(codec.write(1, new Uint8Array(10), 2)).toBe(5);
    });

    it('pushes the offset forward when reading', () => {
        const codec = getHiddenPrefixCodec(getU8Codec(), [prefixA, prefixB]);
        expect(codec.read(b('ffffaabb0100'), 2)).toStrictEqual([1, 5]);
    });

    it('returns a fixed-size if the main codec and all prefix codecs are fixed-size', () => {
        const codec = getHiddenPrefixCodec(getU8Codec(), [prefixA, prefixB]);
        assertIsFixedSize(codec);
        expect(codec.fixedSize).toBe(3);
    });

    it('returns a variable-size codec if at least one of the codec is variable-size', () => {
        const codec = getHiddenPrefixCodec(getUtf8Codec(), [prefixA, prefixB]);
        assertIsVariableSize(codec);
        expect(codec.getSizeFromValue('hello')).toBe(7);
    });
});
