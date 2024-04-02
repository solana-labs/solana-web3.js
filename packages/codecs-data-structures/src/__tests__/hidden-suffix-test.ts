import { assertIsFixedSize, assertIsVariableSize } from '@solana/codecs-core';
import { getU8Codec } from '@solana/codecs-numbers';
import { getUtf8Codec } from '@solana/codecs-strings';

import { getConstantCodec } from '../constant';
import { getHiddenSuffixCodec } from '../hidden-suffix';
import { b } from './__setup__';

describe('getHiddenSuffixCodec', () => {
    const suffixA = getConstantCodec(b('aa'));
    const suffixB = getConstantCodec(b('bb'));

    it('encodes all suffixes after the main encoder', () => {
        const codec = getHiddenSuffixCodec(getU8Codec(), [suffixA, suffixB]);
        expect(codec.encode(1)).toStrictEqual(b('01aabb'));
    });

    it('decodes only the main decoder', () => {
        const codec = getHiddenSuffixCodec(getU8Codec(), [suffixA, suffixB]);
        expect(codec.decode(b('01aabb'))).toBe(1);
    });

    it('pushes the offset forward when writing', () => {
        const codec = getHiddenSuffixCodec(getU8Codec(), [suffixA, suffixB]);
        expect(codec.write(1, new Uint8Array(10), 2)).toBe(5);
    });

    it('pushes the offset forward when reading', () => {
        const codec = getHiddenSuffixCodec(getU8Codec(), [suffixA, suffixB]);
        expect(codec.read(b('ffff01aabb00'), 2)).toStrictEqual([1, 5]);
    });

    it('returns a fixed-size if the main codec and all suffix codecs are fixed-size', () => {
        const codec = getHiddenSuffixCodec(getU8Codec(), [suffixA, suffixB]);
        assertIsFixedSize(codec);
        expect(codec.fixedSize).toBe(3);
    });

    it('returns a variable-size codec if at least one of the codec is variable-size', () => {
        const codec = getHiddenSuffixCodec(getUtf8Codec(), [suffixA, suffixB]);
        assertIsVariableSize(codec);
        expect(codec.getSizeFromValue('hello')).toBe(7);
    });
});
