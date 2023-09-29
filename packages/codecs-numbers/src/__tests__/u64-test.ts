import { Endian } from '../common';
import { getU64Codec } from '../u64';
import { assertRangeError, assertValid } from './__setup__';

const MIN = 0n;
const MAX = BigInt('0xffffffffffffffff');
const HALF = BigInt('0xffffffff');
const u64 = getU64Codec;

describe('getU64Codec', () => {
    it('encodes and decodes u64 numbers', () => {
        expect.hasAssertions();
        const u64LE = u64();
        const u64BE = u64({ endian: Endian.BIG });

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
        assertRangeError(u64LE, MIN - 1n);
        assertRangeError(u64BE, MIN - 1n);
        assertRangeError(u64LE, MAX + 1n);
        assertRangeError(u64BE, MAX + 1n);
    });

    it('has the right description', () => {
        expect(u64().description).toBe('u64(le)');
        expect(u64({ endian: Endian.LITTLE }).description).toBe('u64(le)');
        expect(u64({ endian: Endian.BIG }).description).toBe('u64(be)');
        expect(u64({ description: 'custom' }).description).toBe('custom');
    });

    it('has the right sizes', () => {
        expect(u64().fixedSize).toBe(8);
        expect(u64().maxSize).toBe(8);
    });
});
