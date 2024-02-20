import { getDefaultResponseTransformerForSolanaRpc } from '../response-transformer';
import { KEYPATH_WILDCARD } from '../tree-traversal';

describe('getDefaultResponseTransformerForSolanaRpc', () => {
    describe('given an array as input', () => {
        const input = [10, 10n, '10', ['10', [10n, 10], 10]] as const;
        it('casts the numbers in the array to a `bigint`, recursively', () => {
            const transformer = getDefaultResponseTransformerForSolanaRpc();
            expect(transformer(input)).toStrictEqual([
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
            const transformer = getDefaultResponseTransformerForSolanaRpc();
            expect(transformer(input)).toStrictEqual({
                a: BigInt(input.a),
                b: input.b,
                c: { c1: input.c.c1, c2: BigInt(input.c.c2) },
            });
        });
    });
    describe('where allowlisted numeric values are concerned', () => {
        it.each`
            description                                          | allowedKeyPaths                                      | expectation                                                         | input
            ${'nested array of numeric responses'}               | ${[[0], [1, 1], [1, 2, 1]]}                          | ${[10, [10n, 10, [10n, 10]]]}                                       | ${[10, [10, 10, [10, 10]]]}
            ${'nested array of numeric responses with wildcard'} | ${[[KEYPATH_WILDCARD], [2, KEYPATH_WILDCARD]]}       | ${[1, [2n], [3, 33, 333], 4]}                                       | ${[1, [2], [3, 33, 333], 4]}
            ${'nested array of objects with numeric responses'}  | ${[['a', 'b', KEYPATH_WILDCARD, 'c']]}               | ${{ a: { b: [{ c: 5, d: 5n }, { c: 10, d: 10n }] } }}               | ${{ a: { b: [{ c: 5, d: 5 }, { c: 10, d: 10 }] } }}
            ${'nested object of numeric responses'}              | ${[['a'], ['b', 'b2', 'b2_1'], ['b', 'b2', 'b2_3']]} | ${{ a: 10, b: { b1: 10n, b2: { b2_1: 10, b2_2: 10n, b2_3: 10 } } }} | ${{ a: 10, b: { b1: 10, b2: { b2_1: 10, b2_2: 10, b2_3: 10 } } }}
            ${'numeric response'}                                | ${[[]]}                                              | ${10}                                                               | ${10}
        `(
            'performs no `bigint` upcasts on $description when the allowlist is of the form in test case $#',
            ({ allowedKeyPaths, expectation, input }) => {
                const transformer = getDefaultResponseTransformerForSolanaRpc({
                    allowedNumericKeyPaths: { getFoo: allowedKeyPaths },
                });
                expect(transformer(input, 'getFoo')).toStrictEqual(expectation);
            },
        );
    });
});
