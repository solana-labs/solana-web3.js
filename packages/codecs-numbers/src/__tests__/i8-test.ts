import { getI8Codec } from '../i8';
import { assertRangeError, assertValid, assertValidEncode } from './__setup__';

const MIN = -Number('0x7f') - 1;
const MAX = Number('0x7f');
const i8 = getI8Codec;
const rangeErrorValues = {
    codecDescription: 'i8',
    max: MAX,
    min: MIN,
};

describe('getI8Codec', () => {
    it('encodes and decodes i8 numbers', () => {
        expect.hasAssertions();
        assertValid(i8(), 0, '00');
        assertValid(i8(), 1, '01');
        assertValid(i8(), 42, '2a');
        assertValidEncode(i8(), 0n, '00');
        assertValidEncode(i8(), 1n, '01');
        assertValidEncode(i8(), 42n, '2a');
        assertValid(i8(), -1, 'ff');
        assertValid(i8(), -42, 'd6');

        // Pre-boundaries.
        assertValid(i8(), MIN + 1, '81');
        assertValid(i8(), MAX - 1, '7e');
        assertValidEncode(i8(), BigInt(MAX - 1), '7e');

        // Boundaries.
        assertValid(i8(), MIN, '80');
        assertValid(i8(), MAX, '7f');
        assertValidEncode(i8(), BigInt(MAX), '7f');

        // Out of range.
        assertRangeError(rangeErrorValues, i8(), MIN - 1);
        assertRangeError(rangeErrorValues, i8(), MAX + 1);
        assertRangeError(rangeErrorValues, i8(), BigInt(MAX + 1));
    });

    it('has the right size', () => {
        expect(i8().fixedSize).toBe(1);
    });
});
