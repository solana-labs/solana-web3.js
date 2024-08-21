import fs from 'fs';
import path from 'path';

import { jsonParseWithLargeIntegersAsBigInts, wrapLargeIntegers } from '../json-parse-with-bigint';

const MAX_SAFE_INTEGER: number = Number.MAX_SAFE_INTEGER;
const MAX_SAFE_INTEGER_PLUS_ONE: bigint = BigInt(Number.MAX_SAFE_INTEGER) + 1n;

describe('jsonParseWithLargeNumbersAsBigInts', () => {
    it('parses large integers as bigints', () => {
        const result = jsonParseWithLargeIntegersAsBigInts(`{"value":${MAX_SAFE_INTEGER_PLUS_ONE}}`) as {
            value: unknown;
        };
        expect(result).toEqual({ value: MAX_SAFE_INTEGER_PLUS_ONE });
        expect(typeof result.value).toBe('bigint');
    });
    it('keeps safe integers as numbers', () => {
        const result = jsonParseWithLargeIntegersAsBigInts(`{"value":${MAX_SAFE_INTEGER}}`) as { value: unknown };
        expect(result).toEqual({ value: MAX_SAFE_INTEGER });
        expect(typeof result.value).toBe('number');
    });
    it('does not affect numbers in strings', () => {
        expect(jsonParseWithLargeIntegersAsBigInts(`{"value":"Hello 123 World"}`)).toEqual({
            value: 'Hello 123 World',
        });
    });
    it('does not affect numbers in strings with escaped double quotes', () => {
        expect(jsonParseWithLargeIntegersAsBigInts(`{"value":"Hello\\" 123 World"}`)).toEqual({
            value: 'Hello" 123 World',
        });
    });
    it('parses large integers with exponents as bigints', () => {
        expect(jsonParseWithLargeIntegersAsBigInts(`1e32`)).toBe(100000000000000000000000000000000n);
        expect(jsonParseWithLargeIntegersAsBigInts(`-1189e+32`)).toBe(-118900000000000000000000000000000000n);
    });
    it('does not affect negative exponents', () => {
        expect(jsonParseWithLargeIntegersAsBigInts(`1e-32`)).toBe(1e-32);
        expect(jsonParseWithLargeIntegersAsBigInts(`-1189e-32`)).toBe(-1189e-32);
    });
    it('can parse complex JSON files', () => {
        const largeJsonPath = path.join(__dirname, 'large-json-file.json');
        const largeJsonString = fs.readFileSync(largeJsonPath, 'utf8');
        const expectedResult = JSON.parse(largeJsonString, (key, value) =>
            // eslint-disable-next-line jest/no-conditional-in-test
            key === 'lamports' ? 142302234983644260n : value,
        );
        expect(jsonParseWithLargeIntegersAsBigInts(largeJsonString)).toEqual(expectedResult);
    });
});

describe('wrapLargeIntegers', () => {
    it('wraps large integers as bigint strings', () => {
        expect(wrapLargeIntegers(`{"value":${MAX_SAFE_INTEGER_PLUS_ONE}}`)).toBe(
            `{"value":{"$n":"${MAX_SAFE_INTEGER_PLUS_ONE}"}}`,
        );
    });
    it('keeps safe integers as numbers', () => {
        expect(wrapLargeIntegers(`{"value":${MAX_SAFE_INTEGER}}`)).toBe(`{"value":${MAX_SAFE_INTEGER}}`);
    });
    it('does not wrap numbers in strings', () => {
        expect(wrapLargeIntegers(`{"value":"Hello 123 World"}`)).toBe(`{"value":"Hello 123 World"}`);
    });
    it('does not wrap numbers in strings with escaped double quotes', () => {
        expect(wrapLargeIntegers(`{"value":"Hello\\" 123 World"}`)).toBe(`{"value":"Hello\\" 123 World"}`);
    });
    it('does not alter special keywords', () => {
        expect(wrapLargeIntegers('true')).toBe('true');
        expect(wrapLargeIntegers('false')).toBe('false');
        expect(wrapLargeIntegers('null')).toBe('null');
    });
    it('does not alter safe numbers', () => {
        expect(wrapLargeIntegers('0')).toBe('0');
        expect(wrapLargeIntegers('123456')).toBe('123456');
        expect(wrapLargeIntegers('-123456')).toBe('-123456');
        expect(wrapLargeIntegers('3.14')).toBe('3.14');
        expect(wrapLargeIntegers('-3.14')).toBe('-3.14');
        expect(wrapLargeIntegers('1e5')).toBe('1e5');
        expect(wrapLargeIntegers('-1e5')).toBe('-1e5');
        expect(wrapLargeIntegers('1E5')).toBe('1E5');
        expect(wrapLargeIntegers('-1E5')).toBe('-1E5');
        expect(wrapLargeIntegers(`${MAX_SAFE_INTEGER}`)).toBe(`${MAX_SAFE_INTEGER}`);
        expect(wrapLargeIntegers(`-${MAX_SAFE_INTEGER}`)).toBe(`-${MAX_SAFE_INTEGER}`);
    });
    it('wraps unsafe large integers', () => {
        expect(wrapLargeIntegers('1e32')).toBe('{"$n":"1e32"}');
        expect(wrapLargeIntegers('-1e32')).toBe('{"$n":"-1e32"}');
        expect(wrapLargeIntegers('1E32')).toBe('{"$n":"1E32"}');
        expect(wrapLargeIntegers('-1E32')).toBe('{"$n":"-1E32"}');
        expect(wrapLargeIntegers(`${MAX_SAFE_INTEGER_PLUS_ONE}`)).toBe(`{"$n":"${MAX_SAFE_INTEGER_PLUS_ONE}"}`);
        expect(wrapLargeIntegers(`-${MAX_SAFE_INTEGER_PLUS_ONE}`)).toBe(`{"$n":"-${MAX_SAFE_INTEGER_PLUS_ONE}"}`);
    });
    it('does not alter unsafe large floating points', () => {
        expect(wrapLargeIntegers('3.14e32')).toBe('3.14e32');
        expect(wrapLargeIntegers('-3.14e32')).toBe('-3.14e32');
        expect(wrapLargeIntegers('3.14E32')).toBe('3.14E32');
        expect(wrapLargeIntegers('-3.14E32')).toBe('-3.14E32');
        expect(wrapLargeIntegers(`${MAX_SAFE_INTEGER_PLUS_ONE}.123`)).toBe(`${MAX_SAFE_INTEGER_PLUS_ONE}.123`);
        expect(wrapLargeIntegers(`-${MAX_SAFE_INTEGER_PLUS_ONE}.123`)).toBe(`-${MAX_SAFE_INTEGER_PLUS_ONE}.123`);
    });
    it('does not alter strings', () => {
        expect(wrapLargeIntegers('""')).toBe('""');
        expect(wrapLargeIntegers('"Hello World"')).toBe('"Hello World"');
    });
});
