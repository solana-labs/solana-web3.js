import { Endian } from '../common';
import { getI32Codec } from '../i32';
import { assertRangeError, assertValid } from './__setup__';

const MIN = -Number('0x7fffffff') - 1;
const MAX = Number('0x7fffffff');
const i32 = getI32Codec;
const rangeErrorValues = {
    codecDescription: 'i32',
    max: MAX,
    min: MIN,
};

describe('getI32Codec', () => {
    it('encodes and decodes i32 numbers', () => {
        expect.hasAssertions();
        const i32LE = i32();
        const i32BE = i32({ endian: Endian.Big });

        assertValid(i32LE, 0, '00000000');
        assertValid(i32BE, 0, '00000000');
        assertValid(i32LE, 1, '01000000');
        assertValid(i32BE, 1, '00000001');
        assertValid(i32LE, 42, '2a000000');
        assertValid(i32BE, 42, '0000002a');
        assertValid(i32LE, -1, 'ffffffff');
        assertValid(i32BE, -1, 'ffffffff');
        assertValid(i32LE, -42, 'd6ffffff');
        assertValid(i32BE, -42, 'ffffffd6');

        // Pre-boundaries.
        assertValid(i32LE, MIN + 1, '01000080');
        assertValid(i32BE, MIN + 1, '80000001');
        assertValid(i32LE, MAX - 1, 'feffff7f');
        assertValid(i32BE, MAX - 1, '7ffffffe');

        // Boundaries.
        assertValid(i32LE, MIN, '00000080');
        assertValid(i32BE, MIN, '80000000');
        assertValid(i32LE, MAX, 'ffffff7f');
        assertValid(i32BE, MAX, '7fffffff');

        // Out of range.
        assertRangeError(rangeErrorValues, i32LE, MIN - 1);
        assertRangeError(rangeErrorValues, i32BE, MIN - 1);
        assertRangeError(rangeErrorValues, i32LE, MAX + 1);
        assertRangeError(rangeErrorValues, i32BE, MAX + 1);
    });

    it('has the right size', () => {
        expect(i32().fixedSize).toBe(4);
    });
});
