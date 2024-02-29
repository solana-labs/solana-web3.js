import { getU8Codec } from '../u8';
import { assertRangeError, assertValid } from './__setup__';

const MIN = 0;
const MAX = Number('0xff');
const u8 = getU8Codec;
const rangeErrorValues = {
    codecDescription: 'u8',
    max: MAX,
    min: MIN,
};

describe('getU8Codec', () => {
    it('encodes and decodes u8 numbers', () => {
        expect.hasAssertions();
        assertValid(u8(), 1, '01');
        assertValid(u8(), 42, '2a');

        // Pre-boundaries.
        assertValid(u8(), MIN + 1, '01');
        assertValid(u8(), MAX - 1, 'fe');

        // Boundaries.
        assertValid(u8(), MIN, '00');
        assertValid(u8(), MAX, 'ff');

        // Out of range.
        assertRangeError(rangeErrorValues, u8(), MIN - 1);
        assertRangeError(rangeErrorValues, u8(), MAX + 1);
    });

    it('has the right size', () => {
        expect(u8().fixedSize).toBe(1);
    });
});
