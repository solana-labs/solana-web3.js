import { assertIsUnixTimestamp } from '../unix-timestamp';

describe('assertIsUnixTimestamp()', () => {
    it('throws when supplied a too large number', () => {
        expect(() => {
            assertIsUnixTimestamp(Number.MAX_SAFE_INTEGER);
        }).toThrow();
        expect(() => {
            assertIsUnixTimestamp(8.64e15 + 1);
        }).toThrow();
    });
    it('throws when supplied a too small number', () => {
        expect(() => {
            assertIsUnixTimestamp(Number.MIN_SAFE_INTEGER);
        }).toThrow();
        expect(() => {
            assertIsUnixTimestamp(-8.64e15 - 1);
        }).toThrow();
    });
    it('does not throw when supplied a zero timestamp', () => {
        expect(() => {
            assertIsUnixTimestamp(0);
        }).not.toThrow();
    });
    it('does not throw when supplied a valid non-zero timestamp', () => {
        expect(() => {
            assertIsUnixTimestamp(1_000_000_000);
        }).not.toThrow();
    });
    it('does not throw when supplied the max valid timestamp', () => {
        expect(() => {
            assertIsUnixTimestamp(8.64e15);
        }).not.toThrow();
    });
});
