import { getBigIntUpcastVisitor } from '../response-transformer-bigint-upcast';
import { TraversalState } from '../tree-traversal';

const MOCK_TRAVERSAL_STATE = {
    keyPath: [],
};

describe('bigint upcast visitor', () => {
    describe('given no allowed numeric keypaths', () => {
        let visitNode: (value: unknown, state: TraversalState) => unknown;
        beforeEach(() => {
            visitNode = getBigIntUpcastVisitor([]);
        });
        it.each([10n, '10', null, undefined, Symbol()])('returns the value `%p` as-is', value => {
            expect(visitNode(value, MOCK_TRAVERSAL_STATE)).toBe(value);
        });
        describe('given a `number` as input', () => {
            const input = 10;
            it('casts the input to a `bigint`', () => {
                expect(visitNode(input, MOCK_TRAVERSAL_STATE)).toBe(BigInt(input));
            });
        });
        describe('given a non-integer `number` as input', () => {
            const input = 10.5;
            it('returns the value as-is', () => {
                expect(visitNode(input, MOCK_TRAVERSAL_STATE)).toBe(input);
            });
        });
    });
    describe('given an allowed numeric keypath', () => {
        let visitNode: (value: unknown, state: TraversalState) => unknown;
        beforeEach(() => {
            visitNode = getBigIntUpcastVisitor([[0, 1, 2]]);
        });
        it('casts the input to a `bigint` when the key path does not match', () => {
            expect(visitNode(10, { keyPath: [0, 1, 3] })).toBe(BigInt(10));
        });
        it('does not cast the input to a `bigint` when the key path matches', () => {
            expect(visitNode(10, { keyPath: [0, 1, 2] })).toBe(10);
        });
    });
});
