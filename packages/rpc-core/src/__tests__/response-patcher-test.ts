import { patchResponseForSolanaLabsRpc } from '../response-patcher';
import { getAllowedNumericKeypathsForResponse } from '../response-patcher-allowed-numeric-values';
import { KEYPATH_WILDCARD } from '../response-patcher-types';

jest.mock('../response-patcher-allowed-numeric-values');

describe('patchResponseForSolanaLabsRpc', () => {
    [10n, '10', null, undefined, Symbol()].forEach(input => {
        describe(`given \`${String(input)}\` (${typeof input}) as input`, () => {
            it('returns the value as-is', () => {
                expect(patchResponseForSolanaLabsRpc(input)).toBe(input);
            });
        });
    });
    describe('given a `number` as input', () => {
        const input = 10;
        it('casts the input to a `bigint`', () => {
            expect(patchResponseForSolanaLabsRpc(input)).toBe(BigInt(input));
        });
    });
    describe('given a non-integer `number` as input', () => {
        const input = 10.5;
        it('returns the value as-is', () => {
            expect(patchResponseForSolanaLabsRpc(input)).toBe(input);
        });
    });
    describe('given an array as input', () => {
        const input = [10, 10n, '10', ['10', [10n, 10], 10]] as const;
        it('casts the numbers in the array to a `bigint`, recursively', () => {
            expect(patchResponseForSolanaLabsRpc(input)).toStrictEqual([
                BigInt(input[0]),
                input[1],
                input[2],
                [input[3][0], [input[3][1][0], BigInt(input[3][1][0])], BigInt(input[3][2])],
            ]);
        });
    });
    describe('given an object as input', () => {
        const input = { a: 10, b: 10n, c: { c1: '10', c2: 10 } } as const;
        it('casts the numbers in the object to `bigints`, recursively', () => {
            expect(patchResponseForSolanaLabsRpc(input)).toStrictEqual({
                a: BigInt(input.a),
                b: input.b,
                c: { c1: input.c.c1, c2: BigInt(input.c.c2) },
            });
        });
    });
    describe('where allowlisted numeric values are concerned', () => {
        Object.entries({
            'nested array of numeric responses': {
                allowedKeyPaths: [[0], [1, 1], [1, 2, 1]],
                expectation: [10, [10n, 10, [10n, 10]]],
                input: [10, [10, 10, [10, 10]]],
            },
            'nested array of numeric responses with wildcard': {
                allowedKeyPaths: [[KEYPATH_WILDCARD], [2, KEYPATH_WILDCARD]],
                expectation: [1, [2n], [3, 33, 333], 4],
                input: [1, [2], [3, 33, 333], 4],
            },
            'nested array of objects with numeric responses': {
                allowedKeyPaths: [['a', 'b', KEYPATH_WILDCARD, 'c']],
                expectation: {
                    a: {
                        b: [
                            { c: 5, d: 5n },
                            { c: 10, d: 10n },
                        ],
                    },
                },
                input: {
                    a: {
                        b: [
                            { c: 5, d: 5 },
                            { c: 10, d: 10 },
                        ],
                    },
                },
            },
            'nested object of numeric responses': {
                allowedKeyPaths: [['a'], ['b', 'b2', 'b2_1'], ['b', 'b2', 'b2_3']],
                expectation: { a: 10, b: { b1: 10n, b2: { b2_1: 10, b2_2: 10n, b2_3: 10 } } },
                input: { a: 10, b: { b1: 10, b2: { b2_1: 10, b2_2: 10, b2_3: 10 } } },
            },
            'numeric response': { allowedKeyPaths: [[]], expectation: 10, input: 10 },
        }).forEach(([description, { allowedKeyPaths, expectation, input }]) => {
            it(`performs no \`bigint\` upcasts on ${description} when the allowlist is of the form \`${JSON.stringify(
                allowedKeyPaths
            )}\``, () => {
                jest.mocked(getAllowedNumericKeypathsForResponse).mockReturnValue({ getBlocks: allowedKeyPaths });
                expect(patchResponseForSolanaLabsRpc(input, 'getBlocks')).toStrictEqual(expectation);
            });
        });
    });
});
