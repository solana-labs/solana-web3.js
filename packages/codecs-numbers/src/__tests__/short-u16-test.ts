import { getShortU16Codec } from '../short-u16';
import { assertRangeError, assertValid } from './__setup__';

const MIN = 0;
const MAX = 65535;
const shortU16 = getShortU16Codec;
const rangeErrorValues = {
    codecDescription: 'shortU16',
    max: MAX,
    min: MIN,
};

describe('getShortU16Codec', () => {
    it('encodes and decodes short u16 numbers', () => {
        expect.hasAssertions();
        assertValid(shortU16(), 0, '00');
        assertValid(shortU16(), 1, '01');
        assertValid(shortU16(), 42, '2a');
        assertValid(shortU16(), 127, '7f');
        assertValid(shortU16(), 128, '8001');
        assertValid(shortU16(), 16383, 'ff7f');
        assertValid(shortU16(), 16384, '808001');

        // Pre-boundaries.
        assertValid(shortU16(), MIN + 1, '01');
        assertValid(shortU16(), MAX - 1, 'feff03');

        // Boundaries.
        assertValid(shortU16(), MIN, '00');
        assertValid(shortU16(), MAX, 'ffff03');

        // Out of range.
        assertRangeError(rangeErrorValues, shortU16(), MIN - 1);
        assertRangeError(rangeErrorValues, shortU16(), MAX + 1);

        // Assert re-serialization.
        const codec = shortU16();
        for (let i = 0; i <= 0b1111111111111111; i += 1) {
            const bytes = codec.encode(i);
            expect(codec.decode(bytes)).toBe(i);
        }
    });

    it('has the right sizes', () => {
        expect(shortU16().maxSize).toBe(3);
        expect(shortU16().getSizeFromValue(1)).toBe(1);
        expect(shortU16().getSizeFromValue(127)).toBe(1);
        expect(shortU16().getSizeFromValue(128)).toBe(2);
        expect(shortU16().getSizeFromValue(16383)).toBe(2);
        expect(shortU16().getSizeFromValue(16384)).toBe(3);
    });
});
