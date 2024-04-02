import { addCodecSizePrefix, fixCodecSize, isVariableSize } from '@solana/codecs-core';
import { getU8Codec } from '@solana/codecs-numbers';

import { getBytesCodec } from '../bytes';
import { b } from './__setup__';

describe('getBytesCodec', () => {
    const codec = getBytesCodec();

    it('encodes empty byte arrays', () => {
        expect(codec.encode(b(''))).toStrictEqual(b(''));
    });

    it('decodes empty byte arrays', () => {
        expect(codec.decode(b(''))).toStrictEqual(b(''));
    });

    it('encodes byte arrays as-is', () => {
        expect(codec.encode(b('00'))).toStrictEqual(b('00'));
        expect(codec.encode(b('2aff'))).toStrictEqual(b('2aff'));
        expect(codec.encode(b('1234567890'))).toStrictEqual(b('1234567890'));
    });

    it('decodes byte arrays as-is', () => {
        expect(codec.decode(b('00'))).toStrictEqual(b('00'));
        expect(codec.decode(b('2aff'))).toStrictEqual(b('2aff'));
        expect(codec.decode(b('1234567890'))).toStrictEqual(b('1234567890'));
    });

    it('pushes the offset forward when writing', () => {
        expect(codec.write(b('2aff'), new Uint8Array(10), 3)).toBe(5);
    });

    it('pushes the offset forward when reading', () => {
        expect(codec.read(b('ffff2aff00'), 2)).toStrictEqual([b('2aff00'), 5]);
    });

    it('can use fixCodecSize to become a fixed-size codec', () => {
        const prefixedCoded = fixCodecSize(getBytesCodec(), 3);
        expect(prefixedCoded.encode(b('2aff'))).toStrictEqual(b('2aff00'));
        expect(prefixedCoded.encode(b('2aff00'))).toStrictEqual(b('2aff00'));
        expect(prefixedCoded.encode(b('2aff0000'))).toStrictEqual(b('2aff00'));
        expect(prefixedCoded.decode(b('2aff00'))).toStrictEqual(b('2aff00'));
    });

    it('can use addCodecSizePrefix to prepend the byte array length', () => {
        const prefixedCoded = addCodecSizePrefix(getBytesCodec(), getU8Codec());
        expect(prefixedCoded.encode(b('2aff'))).toStrictEqual(b('022aff'));
        expect(prefixedCoded.decode(b('022aff'))).toStrictEqual(b('2aff'));
        expect(prefixedCoded.getSizeFromValue(b('2aff'))).toBe(3);
    });

    it('returns a variable size codec', () => {
        expect(isVariableSize(codec)).toBe(true);
        expect(codec.getSizeFromValue(b('2aff'))).toBe(2);
    });
});
