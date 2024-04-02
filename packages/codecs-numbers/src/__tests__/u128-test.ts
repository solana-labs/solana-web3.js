import { Endian } from '../common';
import { getU128Codec } from '../u128';
import { assertRangeError, assertValid } from './__setup__';

const MIN = 0n;
const MAX = BigInt('0xffffffffffffffffffffffffffffffff');
const HALF = BigInt('0xffffffffffffffff');
const u128 = getU128Codec;
const rangeErrorValues = {
    codecDescription: 'u128',
    max: MAX,
    min: MIN,
};

describe('getU128Codec', () => {
    it('encodes and decodes u128 numbers', () => {
        expect.hasAssertions();
        const u128LE = u128();
        const u128BE = u128({ endian: Endian.Big });

        assertValid(u128LE, 1n, '01000000000000000000000000000000');
        assertValid(u128BE, 1n, '00000000000000000000000000000001');
        assertValid(u128LE, 42n, '2a000000000000000000000000000000');
        assertValid(u128BE, 42n, '0000000000000000000000000000002a');

        // Half bytes.
        assertValid(u128LE, HALF, 'ffffffffffffffff0000000000000000');
        assertValid(u128BE, HALF, '0000000000000000ffffffffffffffff');

        // Pre-boundaries.
        assertValid(u128LE, MIN + 1n, '01000000000000000000000000000000');
        assertValid(u128BE, MIN + 1n, '00000000000000000000000000000001');
        assertValid(u128LE, MAX - 1n, 'feffffffffffffffffffffffffffffff');
        assertValid(u128BE, MAX - 1n, 'fffffffffffffffffffffffffffffffe');

        // Boundaries.
        assertValid(u128LE, MIN, '00000000000000000000000000000000');
        assertValid(u128BE, MIN, '00000000000000000000000000000000');
        assertValid(u128LE, MAX, 'ffffffffffffffffffffffffffffffff');
        assertValid(u128BE, MAX, 'ffffffffffffffffffffffffffffffff');

        // Out of range.
        assertRangeError(rangeErrorValues, u128LE, MIN - 1n);
        assertRangeError(rangeErrorValues, u128BE, MIN - 1n);
        assertRangeError(rangeErrorValues, u128LE, MAX + 1n);
        assertRangeError(rangeErrorValues, u128BE, MAX + 1n);
    });

    it('has the right size', () => {
        expect(u128().fixedSize).toBe(16);
    });
});
