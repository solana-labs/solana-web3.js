import { assertIsStringifiedNumber } from '../stringified-number';

describe('assertIsStringifiedNumber()', () => {
    it("throws when supplied a string that can't parse as a number", () => {
        expect(() => {
            assertIsStringifiedNumber('abc');
        }).toThrow();
        expect(() => {
            assertIsStringifiedNumber('123a');
        }).toThrow();
    });
    it('does not throw when supplied a string that parses as a float', () => {
        expect(() => {
            assertIsStringifiedNumber('123.0');
        }).not.toThrow();
        expect(() => {
            assertIsStringifiedNumber('123.5');
        }).not.toThrow();
    });
    it('does not throw when supplied a string that parses as an integer', () => {
        expect(() => {
            assertIsStringifiedNumber('-123');
        }).not.toThrow();
        expect(() => {
            assertIsStringifiedNumber('0');
        }).not.toThrow();
        expect(() => {
            assertIsStringifiedNumber('123');
        }).not.toThrow();
    });
});
