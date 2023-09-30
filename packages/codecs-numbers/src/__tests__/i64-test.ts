import { Endian } from '../common';
import { getI64Codec } from '../i64';
import { assertRangeError, assertValid } from './__setup__';

const MIN = -BigInt('0x7fffffffffffffff') - 1n;
const MAX = BigInt('0x7fffffffffffffff');
const i64 = getI64Codec;

describe('getI64Codec', () => {
    it('encodes and decodes i64 numbers', () => {
        expect.hasAssertions();
        const i64LE = i64();
        const i64BE = i64({ endian: Endian.BIG });

        assertValid(i64LE, 0n, '0000000000000000');
        assertValid(i64BE, 0n, '0000000000000000');
        assertValid(i64LE, 1n, '0100000000000000');
        assertValid(i64BE, 1n, '0000000000000001');
        assertValid(i64LE, 42n, '2a00000000000000');
        assertValid(i64BE, 42n, '000000000000002a');
        assertValid(i64LE, -1n, 'ffffffffffffffff');
        assertValid(i64BE, -1n, 'ffffffffffffffff');
        assertValid(i64LE, -42n, 'd6ffffffffffffff');
        assertValid(i64BE, -42n, 'ffffffffffffffd6');

        // Pre-boundaries.
        assertValid(i64LE, MIN + 1n, '0100000000000080');
        assertValid(i64BE, MIN + 1n, '8000000000000001');
        assertValid(i64LE, MAX - 1n, 'feffffffffffff7f');
        assertValid(i64BE, MAX - 1n, '7ffffffffffffffe');

        // Boundaries.
        assertValid(i64LE, MIN, '0000000000000080');
        assertValid(i64BE, MIN, '8000000000000000');
        assertValid(i64LE, MAX, 'ffffffffffffff7f');
        assertValid(i64BE, MAX, '7fffffffffffffff');

        // Out of range.
        assertRangeError(i64LE, MIN - 1n);
        assertRangeError(i64BE, MIN - 1n);
        assertRangeError(i64LE, MAX + 1n);
        assertRangeError(i64BE, MAX + 1n);
    });

    it('has the right description', () => {
        expect(i64().description).toBe('i64(le)');
        expect(i64({ endian: Endian.LITTLE }).description).toBe('i64(le)');
        expect(i64({ endian: Endian.BIG }).description).toBe('i64(be)');
        expect(i64({ description: 'custom' }).description).toBe('custom');
    });

    it('has the right sizes', () => {
        expect(i64().fixedSize).toBe(8);
        expect(i64().maxSize).toBe(8);
    });
});
