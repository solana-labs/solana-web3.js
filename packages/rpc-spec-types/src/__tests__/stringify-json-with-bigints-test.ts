import { stringifyJsonWithBigints } from '../stringify-json-with-bigints';

const MAX_SAFE_INTEGER = BigInt(Number.MAX_SAFE_INTEGER);
const MAX_SAFE_INTEGER_PLUS_ONE = BigInt(Number.MAX_SAFE_INTEGER) + 1n;

describe('stringifyJsonWithBigints', () => {
    it.each`
        input                        | expectedString
        ${0n}                        | ${'0'}
        ${-0n}                       | ${'0'}
        ${1n}                        | ${'1'}
        ${-1n}                       | ${'-1'}
        ${42n}                       | ${'42'}
        ${-42n}                      | ${'-42'}
        ${100000n}                   | ${'100000'}
        ${-100000n}                  | ${'-100000'}
        ${123n * 10n ** 32n}         | ${'12300000000000000000000000000000000'}
        ${-123n * 10n ** 32n}        | ${'-12300000000000000000000000000000000'}
        ${MAX_SAFE_INTEGER}          | ${MAX_SAFE_INTEGER.toString()}
        ${MAX_SAFE_INTEGER_PLUS_ONE} | ${MAX_SAFE_INTEGER_PLUS_ONE.toString()}
    `('strigifies bigint $input as a numerical value', ({ expectedString, input }) => {
        expect(stringifyJsonWithBigints(input)).toBe(expectedString);
    });
    it('strigifies BigInts within nested structures', () => {
        const input = {
            alice: 42n,
            bob: [3.14, BigInt(3e8), { baz: 1234567890123456789012345678901234567890n }],
        };
        expect(stringifyJsonWithBigints(input)).toBe(
            '{"alice":42,"bob":[3.14,300000000,{"baz":1234567890123456789012345678901234567890}]}',
        );
    });
    it.each`
        input          | expectedString
        ${0.5}         | ${'0.5'}
        ${-0.5}        | ${'-0.5'}
        ${3.14159265}  | ${'3.14159265'}
        ${-3.14159265} | ${'-3.14159265'}
        ${1e-5}        | ${'0.00001'}
        ${-1e-5}       | ${'-0.00001'}
        ${1e-32}       | ${'1e-32'}
        ${-1189e-32}   | ${'-1.189e-29'}
    `('strigifies number $input as a numerical value', ({ expectedString, input }) => {
        expect(stringifyJsonWithBigints(input)).toBe(expectedString);
    });
    it.each([
        null,
        false,
        true,
        [],
        [null, true, false],
        {},
        { foo: 'bar' },
        '',
        'Hello World',
        '42 apples',
        'base64',
        '"base64',
        '""base64',
        '\\base64',
        '\\"base64',
        '\\""base64',
        '\\\\base64',
        '\\\\"base64',
        '\\\\""base64',
        'He said: "I will eat 3 bananas"',
        { message_100: 'Hello to the 1st World' },
        { message_200: 'Hello to the "2nd World"' },
        { data: ['', 'base64'] },
    ])('does not alter the value of %s', input => {
        expect(stringifyJsonWithBigints(input)).toBe(JSON.stringify(input));
    });
});
