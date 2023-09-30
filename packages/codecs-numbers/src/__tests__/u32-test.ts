import { Endian } from '../common';
import { getU32Codec } from '../u32';
import { assertRangeError, assertValid } from './__setup__';

const MIN = 0;
const MAX = Number('0xffffffff');
const HALF = Number('0xffff');
const u32 = getU32Codec;

describe('getU32Codec', () => {
    it('encodes and decodes u32 numbers', () => {
        expect.hasAssertions();
        const u32LE = u32();
        const u32BE = u32({ endian: Endian.BIG });

        assertValid(u32LE, 1, '01000000');
        assertValid(u32BE, 1, '00000001');
        assertValid(u32LE, 42, '2a000000');
        assertValid(u32BE, 42, '0000002a');

        // Half bytes.
        assertValid(u32LE, HALF, 'ffff0000');
        assertValid(u32BE, HALF, '0000ffff');

        // Pre-boundaries.
        assertValid(u32LE, MIN + 1, '01000000');
        assertValid(u32BE, MIN + 1, '00000001');
        assertValid(u32LE, MAX - 1, 'feffffff');
        assertValid(u32BE, MAX - 1, 'fffffffe');

        // Boundaries.
        assertValid(u32LE, MIN, '00000000');
        assertValid(u32BE, MIN, '00000000');
        assertValid(u32LE, MAX, 'ffffffff');
        assertValid(u32BE, MAX, 'ffffffff');

        // Out of range.
        assertRangeError(u32LE, MIN - 1);
        assertRangeError(u32BE, MIN - 1);
        assertRangeError(u32LE, MAX + 1);
        assertRangeError(u32BE, MAX + 1);
    });

    it('has the right description', () => {
        expect(u32().description).toBe('u32(le)');
        expect(u32({ endian: Endian.LITTLE }).description).toBe('u32(le)');
        expect(u32({ endian: Endian.BIG }).description).toBe('u32(be)');
        expect(u32({ description: 'custom' }).description).toBe('custom');
    });

    it('has the right sizes', () => {
        expect(u32().fixedSize).toBe(4);
        expect(u32().maxSize).toBe(4);
    });
});
