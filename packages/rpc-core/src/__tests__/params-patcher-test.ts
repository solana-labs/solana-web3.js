import { patchParamsForSolanaLabsRpc } from '../params-patcher';
import { KeyPath, KEYPATH_WILDCARD } from '../patcher-types';

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
    describe('with respect to integer overflows', () => {
        let onIntegerOverflow: (keyPath: (number | string)[], value: bigint) => void;
        beforeEach(() => {
            onIntegerOverflow = jest.fn();
        });
        Object.entries({
            'value above `Number.MAX_SAFE_INTEGER`': BigInt(Number.MAX_SAFE_INTEGER) + 1n,
            'value below `Number.MAX_SAFE_INTEGER`': -BigInt(Number.MAX_SAFE_INTEGER) - 1n,
        }).forEach(([description, value]) => {
            it('calls `onIntegerOverflow` when passed a value ' + description, () => {
                patchParamsForSolanaLabsRpc(value, { onIntegerOverflow });
                expect(onIntegerOverflow).toHaveBeenCalledWith(
                    [], // Equivalent to `params`
                    value,
                );
            });
            it('calls `onIntegerOverflow` when passed a nested array having a value ' + description, () => {
                patchParamsForSolanaLabsRpc([1, 2, [3, value]], { onIntegerOverflow });
                expect(onIntegerOverflow).toHaveBeenCalledWith(
                    [2, 1], // Equivalent to `params[2][1]`.
                    value,
                );
            });
            it('calls `onIntegerOverflow` when passed a nested object having a value ' + description, () => {
                patchParamsForSolanaLabsRpc({ a: 1, b: { b1: 2, b2: value } }, { onIntegerOverflow });
                expect(onIntegerOverflow).toHaveBeenCalledWith(
                    ['b', 'b2'], // Equivalent to `params.b.b2`.
                    value,
                );
            });
            it('does not call `onIntegerOverflow` when passed `Number.MAX_SAFE_INTEGER`', () => {
                patchParamsForSolanaLabsRpc(BigInt(Number.MAX_SAFE_INTEGER), { onIntegerOverflow });
                expect(onIntegerOverflow).not.toHaveBeenCalled();
            });
        });
    });
    describe.each`
        replacement      | keyPaths                     | params                                 | expectedTransformees           | expectedPatchedParams
        ${'🍕'}          | ${[[KEYPATH_WILDCARD]]}      | ${[1, [2, 22], { foo: 3 }, 4]}         | ${[1, [2, 22], { foo: 3 }, 4]} | ${['🍕', '🍕', '🍕', '🍕']}
        ${'🍕'}          | ${[[1, 1], [2, 'foo']]}      | ${[1, [2, 22], { foo: 3 }, 4]}         | ${[22, 3]}                     | ${[1, [2, '🍕'], { foo: '🍕' }, 4]}
        ${'🍕'}          | ${[['foo', 1, 'bar']]}       | ${{ baz: 1, foo: [2, { bar: 3 }, 4] }} | ${[3]}                         | ${{ baz: 1, foo: [2, { bar: '🍕' }, 4] }}
        ${'🍕'}          | ${[['foo'], ['foo', 'bar']]} | ${{ foo: { bar: 1 } }}                 | ${[{ bar: 1 }]}                | ${{ foo: '🍕' }}
        ${'🍕'}          | ${[['foo'], ['foo']]}        | ${{ foo: { bar: 1 } }}                 | ${[{ bar: 1 }, '🍕']}          | ${{ foo: '🍕' }}
        ${{ bar: '🍕' }} | ${[['foo'], ['foo', 'bar']]} | ${{ foo: 1 }}                          | ${[1, '🍕']}                   | ${{ foo: { bar: { bar: '🍕' } } }}
        ${{ bar: '🍕' }} | ${[['foo', 'bar'], ['foo']]} | ${{ foo: 1 }}                          | ${[1, '🍕']}                   | ${{ foo: { bar: { bar: '🍕' } } }}
    `(
        'given a transformer with the key paths from test case $#',
        ({
            expectedTransformees,
            expectedPatchedParams,
            keyPaths,
            params,
            replacement,
        }: {
            expectedPatchedParams: unknown;
            expectedTransformees: unknown[];
            keyPaths: KeyPath[];
            params: unknown;
            replacement: unknown;
        }) => {
            let nodeTransformersForKeyPaths: NonNullable<
                NonNullable<Parameters<typeof patchParamsForSolanaLabsRpc>[1]>['nodeTransformersForKeyPaths']
            >;
            let nodeTransformer: jest.Mock;
            beforeEach(() => {
                nodeTransformer = jest.fn().mockReturnValue(replacement);
                nodeTransformersForKeyPaths = keyPaths.map(keyPath => [keyPath, nodeTransformer]);
            });
            it('calls the transformer with the expected nodes', () => {
                expect.hasAssertions();
                patchParamsForSolanaLabsRpc(params, { nodeTransformersForKeyPaths });
                expectedTransformees.forEach((transformee, ii) => {
                    expect(nodeTransformer).toHaveBeenNthCalledWith(ii + 1, transformee);
                });
                expect(nodeTransformer).toHaveBeenCalledTimes(expectedTransformees.length);
            });
            it('replaces the nodes with the output of the transformer', () => {
                expect(patchParamsForSolanaLabsRpc(params, { nodeTransformersForKeyPaths })).toStrictEqual(
                    expectedPatchedParams,
                );
            });
        },
    );
});
