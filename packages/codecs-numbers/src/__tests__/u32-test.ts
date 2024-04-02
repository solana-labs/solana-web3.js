import { Endian } from '../common';
import { getU32Codec } from '../u32';
import { assertRangeError, assertValid } from './__setup__';

const MIN = 0;
const MAX = Number('0xffffffff');
const HALF = Number('0xffff');
const u32 = getU32Codec;
const rangeErrorValues = {
    codecDescription: 'u32',
    max: MAX,
    min: MIN,
};

describe('getU32Codec', () => {
    it('encodes and decodes u32 numbers', () => {
        expect.hasAssertions();
        const u32LE = u32();
        const u32BE = u32({ endian: Endian.Big });

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
        assertRangeError(rangeErrorValues, u32LE, MIN - 1);
        assertRangeError(rangeErrorValues, u32BE, MIN - 1);
        assertRangeError(rangeErrorValues, u32LE, MAX + 1);
        assertRangeError(rangeErrorValues, u32BE, MAX + 1);
    });

    it('has the right size', () => {
        expect(u32().fixedSize).toBe(4);
    });
});
