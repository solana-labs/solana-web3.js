import { getParamsPatcherForSolanaLabsRpc } from '../params-patcher';

describe('getParamsPatcherForSolanaLabsRpc', () => {
    describe('given no config', () => {
        let paramsTransformer: (value: unknown) => unknown;
        beforeEach(() => {
            const patcher = getParamsPatcherForSolanaLabsRpc();
            paramsTransformer = value => patcher(value, 'getFoo' /* methodName */);
        });
        describe('given an array as input', () => {
            const input = [10n, 10, '10', ['10', [10, 10n], 10n]] as const;
            it('casts the bigints in the array to a `number`, recursively', () => {
                expect(paramsTransformer(input)).toStrictEqual([
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
                expect(paramsTransformer(input)).toStrictEqual({
                    a: Number(input.a),
                    b: input.b,
                    c: { c1: input.c.c1, c2: Number(input.c.c2) },
                });
            });
        });
    });
    describe('given an integer overflow handler', () => {
        let onIntegerOverflow: jest.Mock;
        let paramsTransformer: (value: unknown) => unknown;
        beforeEach(() => {
            onIntegerOverflow = jest.fn();
            const patcher = getParamsPatcherForSolanaLabsRpc({ onIntegerOverflow });
            paramsTransformer = value => patcher(value, 'getFoo' /* methodName */);
        });
        Object.entries({
            'value above `Number.MAX_SAFE_INTEGER`': BigInt(Number.MAX_SAFE_INTEGER) + 1n,
            'value below `Number.MAX_SAFE_INTEGER`': -BigInt(Number.MAX_SAFE_INTEGER) - 1n,
        }).forEach(([description, value]) => {
            it('calls `onIntegerOverflow` when passed a value ' + description, () => {
                paramsTransformer(value);
                expect(onIntegerOverflow).toHaveBeenCalledWith(
                    'getFoo',
                    [], // Equivalent to `params`
                    value,
                );
            });
            it('calls `onIntegerOverflow` when passed a nested array having a value ' + description, () => {
                paramsTransformer([1, 2, [3, value]]);
                expect(onIntegerOverflow).toHaveBeenCalledWith(
                    'getFoo',
                    [2, 1], // Equivalent to `params[2][1]`.
                    value,
                );
            });
            it('calls `onIntegerOverflow` when passed a nested object having a value ' + description, () => {
                paramsTransformer({ a: 1, b: { b1: 2, b2: value } });
                expect(onIntegerOverflow).toHaveBeenCalledWith(
                    'getFoo',
                    ['b', 'b2'], // Equivalent to `params.b.b2`.
                    value,
                );
            });
            it('does not call `onIntegerOverflow` when passed `Number.MAX_SAFE_INTEGER`', () => {
                paramsTransformer(BigInt(Number.MAX_SAFE_INTEGER));
                expect(onIntegerOverflow).not.toHaveBeenCalled();
            });
        });
    });
});
