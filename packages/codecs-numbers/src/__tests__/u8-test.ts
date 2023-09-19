import { getU8Codec } from '../u8';
import { assertRangeError, assertValid } from './__setup__';

const MIN = 0;
const MAX = Number('0xff');
const u8 = getU8Codec;

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
        assertRangeError(u8(), MIN - 1);
        assertRangeError(u8(), MAX + 1);
    });

    it('has the right description', () => {
        expect(u8().description).toBe('u8');
        expect(u8({ description: 'custom' }).description).toBe('custom');
    });

    it('has the right sizes', () => {
        expect(u8().fixedSize).toBe(1);
        expect(u8().maxSize).toBe(1);
    });
});
