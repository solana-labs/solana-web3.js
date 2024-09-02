import fs from 'fs';
import path from 'path';

import { parseJsonWithBigInts } from '../parse-json-with-bigints';

const MAX_SAFE_INTEGER = BigInt(Number.MAX_SAFE_INTEGER);
const MAX_SAFE_INTEGER_PLUS_ONE = BigInt(Number.MAX_SAFE_INTEGER) + 1n;

describe('parseJsonWithBigInts', () => {
    it.each`
        input                                   | expectedBigInt
        ${'0'}                                  | ${0n}
        ${'-0'}                                 | ${-0n}
        ${'1'}                                  | ${1n}
        ${'-1'}                                 | ${-1n}
        ${'42'}                                 | ${42n}
        ${'-42'}                                | ${-42n}
        ${'1e5'}                                | ${100000n}
        ${'-1e5'}                               | ${-100000n}
        ${'1E5'}                                | ${100000n}
        ${'-1E5'}                               | ${-100000n}
        ${'123e+32'}                            | ${123n * 10n ** 32n}
        ${'-123e+32'}                           | ${-123n * 10n ** 32n}
        ${'123E+32'}                            | ${123n * 10n ** 32n}
        ${'-123E+32'}                           | ${-123n * 10n ** 32n}
        ${MAX_SAFE_INTEGER.toString()}          | ${MAX_SAFE_INTEGER}
        ${MAX_SAFE_INTEGER_PLUS_ONE.toString()} | ${MAX_SAFE_INTEGER_PLUS_ONE}
    `('parses $input as a bigint', ({ expectedBigInt, input }) => {
        expect(parseJsonWithBigInts(input)).toBe(expectedBigInt);
    });
    it('parses BigInts within nested structures', () => {
        const input = '{ "alice": 42, "bob": [3.14, 3e+8, { "baz": 1234567890123456789012345678901234567890 }] }';
        expect(parseJsonWithBigInts(input)).toStrictEqual({
            alice: 42n,
            bob: [3.14, BigInt(3e8), { baz: 1234567890123456789012345678901234567890n }],
        });
    });
    it.each`
        input            | expectedNumber
        ${'0.5'}         | ${0.5}
        ${'-0.5'}        | ${-0.5}
        ${'3.14159265'}  | ${3.14159265}
        ${'-3.14159265'} | ${-3.14159265}
        ${'1e-5'}        | ${1e-5}
        ${'-1e-5'}       | ${-1e-5}
        ${'1E-5'}        | ${1e-5}
        ${'-1E-5'}       | ${-1e-5}
        ${'1e-32'}       | ${1e-32}
        ${'-1189e-32'}   | ${-1189e-32}
    `('parses $input as a number', ({ expectedNumber, input }) => {
        expect(parseJsonWithBigInts(input)).toBe(expectedNumber);
    });
    it.each([
        'null',
        'false',
        'true',
        '[]',
        '[null, true, false]',
        '{}',
        '{ "foo": "bar" }',
        '""',
        '"Hello World"',
        '"42 apples"',
        '"base64"',
        '"\\base64"',
        '"\\"base64"',
        '"\\\\base64"',
        '"\\"\\"base64"',
        '"\\\\\\"base64"',
        '"\\\\\\"\\"base64"',
        '"He said: \\"I will eat 3 bananas\\""',
        '{ "message_100": "Hello to the 1st World" }',
        '{ "message_200": "Hello to the \\"2nd World\\"" }',
        '{"data":["","base64"]}',
    ])('does not alter the value of %s', input => {
        expect(parseJsonWithBigInts(input)).toStrictEqual(JSON.parse(input));
    });
    it('can parse complex JSON files', () => {
        const largeJsonPath = path.join(__dirname, 'large-json-file.json');
        const largeJsonString = fs.readFileSync(largeJsonPath, 'utf8');
        const expectedResult = JSON.parse(largeJsonString, (key, value) => {
            // eslint-disable-next-line jest/no-conditional-in-test
            if (key === 'lamports') return 142302234983644260n;
            // eslint-disable-next-line jest/no-conditional-in-test
            if (typeof value === 'number' && Number.isInteger(value)) return BigInt(value);
            return value;
        });
        expect(parseJsonWithBigInts(largeJsonString)).toStrictEqual(expectedResult);
    });
});
