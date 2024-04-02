import { getU16Codec } from '@solana/codecs-numbers';
import { SOLANA_ERROR__CODECS__EXPECTED_ZERO_VALUE_TO_MATCH_ITEM_FIXED_SIZE, SolanaError } from '@solana/errors';

import { none, some } from '../option';
import { getZeroableOptionCodec } from '../zeroable-option-codec';
import { b } from './__setup__';

describe('getZeroableOptionCodec', () => {
    it('encodes Some values without a boolean prefix', () => {
        const codec = getZeroableOptionCodec(getU16Codec());
        expect(codec.encode(257)).toStrictEqual(b('0101'));
        expect(codec.encode(some(257))).toStrictEqual(b('0101'));
    });

    it('decodes Some values without a boolean prefix', () => {
        const codec = getZeroableOptionCodec(getU16Codec());
        expect(codec.decode(b('0101'))).toStrictEqual(some(257));
    });

    it('encodes None values using zeroes by default', () => {
        const codec = getZeroableOptionCodec(getU16Codec());
        expect(codec.encode(null)).toStrictEqual(b('0000'));
        expect(codec.encode(none())).toStrictEqual(b('0000'));
    });

    it('decodes zeroes as None values by default', () => {
        const codec = getZeroableOptionCodec(getU16Codec());
        expect(codec.decode(b('0000'))).toStrictEqual(none());
    });

    it('can encode None values using a provided custom zero-value', () => {
        const codec = getZeroableOptionCodec(getU16Codec(), {
            zeroValue: b('ffff'),
        });
        expect(codec.encode(null)).toStrictEqual(b('ffff'));
        expect(codec.encode(0)).toStrictEqual(b('0000'));
    });

    it('can decode a provided custom zero-value as None', () => {
        const codec = getZeroableOptionCodec(getU16Codec(), {
            zeroValue: b('ffff'),
        });
        expect(codec.decode(b('ffff'))).toStrictEqual(none());
        expect(codec.decode(b('0000'))).toStrictEqual(some(0));
    });

    it('pushes the offset forward when writing', () => {
        const codec = getZeroableOptionCodec(getU16Codec());
        expect(codec.write(257, new Uint8Array(10), 3)).toBe(5);
    });

    it('pushes the offset forward when reading', () => {
        const codec = getZeroableOptionCodec(getU16Codec());
        expect(codec.read(b('ffff010100'), 2)).toStrictEqual([some(257), 4]);
    });

    it('throws when the provided zero-value does not match the fixed-size of the item', () => {
        expect(() =>
            getZeroableOptionCodec(getU16Codec(), {
                zeroValue: b('ffffff'),
            }),
        ).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__EXPECTED_ZERO_VALUE_TO_MATCH_ITEM_FIXED_SIZE, {
                codecDescription: 'zeroableOption',
                expectedSize: 2,
                hexZeroValue: 'ffffff',
                zeroValue: b('ffffff'),
            }),
        );
    });

    it('returns a fixed-size codec of the same size as the provided item', () => {
        const codec = getZeroableOptionCodec(getU16Codec());
        expect(codec.fixedSize).toBe(2);
    });
});
