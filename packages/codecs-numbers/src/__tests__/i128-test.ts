import { Endian } from '../common';
import { getI128Codec } from '../i128';
import { assertRangeError, assertValid } from './__setup__';

const MIN = -BigInt('0x7fffffffffffffffffffffffffffffff') - 1n;
const MAX = BigInt('0x7fffffffffffffffffffffffffffffff');
const i128 = getI128Codec;
const rangeErrorValues = {
    codecDescription: 'i128',
    max: MAX,
    min: MIN,
};

describe('getI128Codec', () => {
    it('encodes and decodes i128 numbers', () => {
        expect.hasAssertions();
        const i128LE = i128();
        const i128BE = i128({ endian: Endian.Big });

        assertValid(i128LE, 0n, '00000000000000000000000000000000');
        assertValid(i128BE, 0n, '00000000000000000000000000000000');
        assertValid(i128LE, 1n, '01000000000000000000000000000000');
        assertValid(i128BE, 1n, '00000000000000000000000000000001');
        assertValid(i128LE, 42n, '2a000000000000000000000000000000');
        assertValid(i128BE, 42n, '0000000000000000000000000000002a');
        assertValid(i128LE, -1n, 'ffffffffffffffffffffffffffffffff');
        assertValid(i128BE, -1n, 'ffffffffffffffffffffffffffffffff');
        assertValid(i128LE, -42n, 'd6ffffffffffffffffffffffffffffff');
        assertValid(i128BE, -42n, 'ffffffffffffffffffffffffffffffd6');

        // Pre-boundaries.
        assertValid(i128LE, MIN + 1n, '01000000000000000000000000000080');
        assertValid(i128BE, MIN + 1n, '80000000000000000000000000000001');
        assertValid(i128LE, MAX - 1n, 'feffffffffffffffffffffffffffff7f');
        assertValid(i128BE, MAX - 1n, '7ffffffffffffffffffffffffffffffe');

        // Boundaries.
        assertValid(i128LE, MIN, '00000000000000000000000000000080');
        assertValid(i128BE, MIN, '80000000000000000000000000000000');
        assertValid(i128LE, MAX, 'ffffffffffffffffffffffffffffff7f');
        assertValid(i128BE, MAX, '7fffffffffffffffffffffffffffffff');

        // Out of range.
        assertRangeError(rangeErrorValues, i128LE, MIN - 1n);
        assertRangeError(rangeErrorValues, i128BE, MIN - 1n);
        assertRangeError(rangeErrorValues, i128LE, MAX + 1n);
        assertRangeError(rangeErrorValues, i128BE, MAX + 1n);
    });

    it('has the right size', () => {
        expect(i128().fixedSize).toBe(16);
    });
});
