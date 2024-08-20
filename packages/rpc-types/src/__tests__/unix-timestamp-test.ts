import { assertIsUnixTimestamp } from '../unix-timestamp';

describe('assertIsUnixTimestamp()', () => {
    it('throws when supplied a too large number', () => {
        expect(() => {
            assertIsUnixTimestamp(BigInt(2n ** 63n));
        }).toThrow();
        expect(() => {
            assertIsUnixTimestamp(BigInt('9223372036854775808'));
        }).toThrow();
    });
    it('throws when supplied a too small number', () => {
        expect(() => {
            assertIsUnixTimestamp(BigInt(BigInt(-(2n ** 63n)) - 1n));
        }).toThrow();
        expect(() => {
            assertIsUnixTimestamp(BigInt('-9223372036854775809'));
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
            assertIsUnixTimestamp(BigInt(BigInt(2n ** 63n) - 1n));
        }).not.toThrow();
        expect(() => {
            assertIsUnixTimestamp(BigInt('9223372036854775807'));
        }).not.toThrow();
    });
});
