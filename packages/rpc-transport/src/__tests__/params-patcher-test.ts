import { patchParamsForSolanaLabsRpc } from '../params-patcher';

describe('patchParamsForSolanaLabsRpc', () => {
    [10, '10', null, undefined, Symbol()].forEach(input => {
        describe(`given \`${String(input)}\` (${typeof input}) as input`, () => {
            it('returns the value as-is', () => {
                expect(patchParamsForSolanaLabsRpc(input)).toBe(input);
            });
        });
    });
    describe('given a `bigint` as input', () => {
        const input = 10n;
        it('casts the input to a `number`', () => {
            expect(patchParamsForSolanaLabsRpc(input)).toBe(Number(input));
        });
    });
    describe('given a `bigint` two larger than `Number.MAX_SAFE_INTEGER` as input', () => {
        const input = BigInt(Number.MAX_SAFE_INTEGER) + 2n; // 9007199254740993
        it('casts the input to a `number`', () => {
            expect(input - BigInt(patchParamsForSolanaLabsRpc(input)))
                // Incorrectly rounds to 9007199254740992, leaving a difference of 1.
                .toBe(1n);
        });
    });
    describe('given an array as input', () => {
        const input = [10n, 10, '10', ['10', [10, 10n], 10n]] as const;
        it('casts the bigints in the array to a `number`, recursively', () => {
            expect(patchParamsForSolanaLabsRpc(input)).toStrictEqual([
                Number(input[0]),
                input[1],
                input[2],
                [input[3][0], [input[3][1][0], Number(input[3][1][0])], Number(input[3][2])],
            ]);
        });
    });
    describe('given an object as input', () => {
        const input = { a: 10n, b: 10, c: { c1: '10', c2: 10n } } as const;
        it('casts the bigints in the array to a `number`, recursively', () => {
            expect(patchParamsForSolanaLabsRpc(input)).toStrictEqual({
                a: Number(input.a),
                b: input.b,
                c: { c1: input.c.c1, c2: Number(input.c.c2) },
            });
        });
    });
});
