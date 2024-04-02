import { Endian } from '../common';
import { getU64Codec } from '../u64';
import { assertRangeError, assertValid } from './__setup__';

const MIN = 0n;
const MAX = BigInt('0xffffffffffffffff');
const HALF = BigInt('0xffffffff');
const u64 = getU64Codec;
const rangeErrorValues = {
    codecDescription: 'u64',
    max: MAX,
    min: MIN,
};

describe('getU64Codec', () => {
    it('encodes and decodes u64 numbers', () => {
        expect.hasAssertions();
        const u64LE = u64();
        const u64BE = u64({ endian: Endian.Big });

        assertValid(u64LE, 1n, '0100000000000000');
        assertValid(u64BE, 1n, '0000000000000001');
        assertValid(u64LE, 42n, '2a00000000000000');
        assertValid(u64BE, 42n, '000000000000002a');

        // Half bytes.
        assertValid(u64LE, HALF, 'ffffffff00000000');
        assertValid(u64BE, HALF, '00000000ffffffff');

        // Pre-boundaries.
        assertValid(u64LE, MIN + 1n, '0100000000000000');
        assertValid(u64BE, MIN + 1n, '0000000000000001');
        assertValid(u64LE, MAX - 1n, 'feffffffffffffff');
        assertValid(u64BE, MAX - 1n, 'fffffffffffffffe');

        // Boundaries.
        assertValid(u64LE, MIN, '0000000000000000');
        assertValid(u64BE, MIN, '0000000000000000');
        assertValid(u64LE, MAX, 'ffffffffffffffff');
        assertValid(u64BE, MAX, 'ffffffffffffffff');

        // Out of range.
        assertRangeError(rangeErrorValues, u64LE, MIN - 1n);
        assertRangeError(rangeErrorValues, u64BE, MIN - 1n);
        assertRangeError(rangeErrorValues, u64LE, MAX + 1n);
        assertRangeError(rangeErrorValues, u64BE, MAX + 1n);
    });

    it('has the right size', () => {
        expect(u64().fixedSize).toBe(8);
    });
});
