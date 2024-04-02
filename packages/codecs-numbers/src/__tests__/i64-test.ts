import { Endian } from '../common';
import { getI64Codec } from '../i64';
import { assertRangeError, assertValid } from './__setup__';

const MIN = -BigInt('0x7fffffffffffffff') - 1n;
const MAX = BigInt('0x7fffffffffffffff');
const i64 = getI64Codec;
const rangeErrorValues = {
    codecDescription: 'i64',
    max: MAX,
    min: MIN,
};

describe('getI64Codec', () => {
    it('encodes and decodes i64 numbers', () => {
        expect.hasAssertions();
        const i64LE = i64();
        const i64BE = i64({ endian: Endian.Big });

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
        assertRangeError(rangeErrorValues, i64LE, MIN - 1n);
        assertRangeError(rangeErrorValues, i64BE, MIN - 1n);
        assertRangeError(rangeErrorValues, i64LE, MAX + 1n);
        assertRangeError(rangeErrorValues, i64BE, MAX + 1n);
    });

    it('has the right size', () => {
        expect(i64().fixedSize).toBe(8);
    });
});
