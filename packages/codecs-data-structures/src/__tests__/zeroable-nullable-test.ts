import { getU16Codec } from '@solana/codecs-numbers';
import { SOLANA_ERROR__CODECS__EXPECTED_ZERO_VALUE_TO_MATCH_ITEM_FIXED_SIZE, SolanaError } from '@solana/errors';

import { getZeroableNullableCodec } from '../zeroable-nullable';
import { b } from './__setup__';

describe('getZeroableNullableCodec', () => {
    it('encodes non-null values without a boolean prefix', () => {
        const codec = getZeroableNullableCodec(getU16Codec());
        expect(codec.encode(257)).toStrictEqual(b('0101'));
    });

    it('decodes non-null values without a boolean prefix', () => {
        const codec = getZeroableNullableCodec(getU16Codec());
        expect(codec.decode(b('0101'))).toBe(257);
    });

    it('encodes null values using zeroes by default', () => {
        const codec = getZeroableNullableCodec(getU16Codec());
        expect(codec.encode(null)).toStrictEqual(b('0000'));
    });

    it('decodes zeroes as null values by default', () => {
        const codec = getZeroableNullableCodec(getU16Codec());
        expect(codec.decode(b('0000'))).toBeNull();
    });

    it('can encode null values using a provided custom zero-value', () => {
        const codec = getZeroableNullableCodec(getU16Codec(), {
            zeroValue: b('ffff'),
        });
        expect(codec.encode(null)).toStrictEqual(b('ffff'));
        expect(codec.encode(0)).toStrictEqual(b('0000'));
    });

    it('can decode a provided custom zero-value as null', () => {
        const codec = getZeroableNullableCodec(getU16Codec(), {
            zeroValue: b('ffff'),
        });
        expect(codec.decode(b('ffff'))).toBeNull();
        expect(codec.decode(b('0000'))).toBe(0);
    });

    it('pushes the offset forward when writing', () => {
        const codec = getZeroableNullableCodec(getU16Codec());
        expect(codec.write(257, new Uint8Array(10), 3)).toBe(5);
    });

    it('pushes the offset forward when reading', () => {
        const codec = getZeroableNullableCodec(getU16Codec());
        expect(codec.read(b('ffff010100'), 2)).toStrictEqual([257, 4]);
    });

    it('throws when the provided zero-value does not match the fixed-size of the item', () => {
        expect(() =>
            getZeroableNullableCodec(getU16Codec(), {
                zeroValue: b('ffffff'),
            }),
        ).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__EXPECTED_ZERO_VALUE_TO_MATCH_ITEM_FIXED_SIZE, {
                codecDescription: 'zeroableNullable',
                expectedSize: 2,
                hexZeroValue: 'ffffff',
                zeroValue: b('ffffff'),
            }),
        );
    });

    it('returns a fixed-size codec of the same size as the provided item', () => {
        const codec = getZeroableNullableCodec(getU16Codec());
        expect(codec.fixedSize).toBe(2);
    });
});
