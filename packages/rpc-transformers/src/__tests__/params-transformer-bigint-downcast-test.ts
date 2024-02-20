import { downcastNodeToNumberIfBigint } from '../params-transformer-bigint-downcast';

describe('bigint downcast visitor', () => {
    it.each([10, '10', null, undefined, Symbol()])('returns the value `%p` as-is', value => {
        expect(downcastNodeToNumberIfBigint(value)).toBe(value);
    });
    describe('given a `bigint` as input', () => {
        const input = 10n;
        it('casts the input to a `number`', () => {
            expect(downcastNodeToNumberIfBigint(input)).toBe(Number(input));
        });
    });
    describe('given a `bigint` two larger than `Number.MAX_SAFE_INTEGER` as input', () => {
        const input = BigInt(Number.MAX_SAFE_INTEGER) + 2n; // 9007199254740993
        it('casts the input to a `number`', () => {
            expect(input - BigInt(downcastNodeToNumberIfBigint(input)))
                // Incorrectly rounds to 9007199254740992, leaving a difference of 1.
                .toBe(1n);
        });
    });
});
