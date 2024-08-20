import { assertIsUnixTimestamp } from '../unix-timestamp';

describe('assertIsUnixTimestamp()', () => {
    it('throws when supplied a too large number', () => {
        expect(() => {
            assertIsUnixTimestamp(BigInt(Number.MAX_SAFE_INTEGER));
        }).toThrow();
        expect(() => {
            assertIsUnixTimestamp(BigInt(8.64e15 + 1));
        }).toThrow();
    });
    it('throws when supplied a too small number', () => {
        expect(() => {
            assertIsUnixTimestamp(BigInt(Number.MIN_SAFE_INTEGER));
        }).toThrow();
        expect(() => {
            assertIsUnixTimestamp(BigInt(-8.64e15 - 1));
        }).toThrow();
    });
    it('does not throw when supplied a zero timestamp', () => {
        expect(() => {
            assertIsUnixTimestamp(0n);
        }).not.toThrow();
    });
    it('does not throw when supplied a valid non-zero timestamp', () => {
        expect(() => {
            assertIsUnixTimestamp(1_000_000_000n);
        }).not.toThrow();
    });
    it('does not throw when supplied the max valid timestamp', () => {
        expect(() => {
            assertIsUnixTimestamp(BigInt(8.64e15));
        }).not.toThrow();
    });
});
