import { patchResponseForSolanaLabsRpc } from '../response-patcher';

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
});
