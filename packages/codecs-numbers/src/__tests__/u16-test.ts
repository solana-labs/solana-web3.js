import { Endian } from '../common';
import { getU16Codec } from '../u16';
import { assertRangeError, assertValid } from './__setup__';

const MIN = 0;
const MAX = Number('0xffff');
const HALF = Number('0xff');
const u16 = getU16Codec;

describe('getU16Codec', () => {
    it('encodes and decodes u16 numbers', () => {
        expect.hasAssertions();
        const u16LE = u16();
        const u16BE = u16({ endian: Endian.BIG });

        assertValid(u16LE, 1, '0100');
        assertValid(u16BE, 1, '0001');
        assertValid(u16LE, 42, '2a00');
        assertValid(u16BE, 42, '002a');

        // Half bytes.
        assertValid(u16LE, HALF, 'ff00');
        assertValid(u16BE, HALF, '00ff');

        // Pre-boundaries.
        assertValid(u16LE, MIN + 1, '0100');
        assertValid(u16BE, MIN + 1, '0001');
        assertValid(u16LE, MAX - 1, 'feff');
        assertValid(u16BE, MAX - 1, 'fffe');

        // Boundaries.
        assertValid(u16LE, MIN, '0000');
        assertValid(u16BE, MIN, '0000');
        assertValid(u16LE, MAX, 'ffff');
        assertValid(u16BE, MAX, 'ffff');

        // Out of range.
        assertRangeError(u16LE, MIN - 1);
        assertRangeError(u16BE, MIN - 1);
        assertRangeError(u16LE, MAX + 1);
        assertRangeError(u16BE, MAX + 1);
    });

    it('has the right description', () => {
        expect(u16().description).toBe('u16(le)');
        expect(u16({ endian: Endian.LITTLE }).description).toBe('u16(le)');
        expect(u16({ endian: Endian.BIG }).description).toBe('u16(be)');
        expect(u16({ description: 'custom' }).description).toBe('custom');
    });

    it('has the right sizes', () => {
        expect(u16().fixedSize).toBe(2);
        expect(u16().maxSize).toBe(2);
    });
});
