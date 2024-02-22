import { getIntegerOverflowNodeVisitor } from '../params-transformer-integer-overflow';
import { TraversalState } from '../tree-traversal';

const MOCK_TRAVERSAL_STATE = {
    keyPath: [1, 'foo', 'bar'],
};

describe('integer overflow visitor', () => {
    let onIntegerOverflow: jest.Mock;
    let visitNode: <T>(value: T, state: TraversalState) => T;
    beforeEach(() => {
        onIntegerOverflow = jest.fn().mockImplementation(([_, v]) => v);
        visitNode = getIntegerOverflowNodeVisitor(onIntegerOverflow);
    });
    it.each([10, 10n, '10', null, undefined, Symbol()])('returns the value `%p` as-is', value => {
        expect(visitNode(value, MOCK_TRAVERSAL_STATE)).toBe(value);
    });
    describe.each([
        ['value above `Number.MAX_SAFE_INTEGER`', BigInt(Number.MAX_SAFE_INTEGER) + 1n],
        ['value below `Number.MAX_SAFE_INTEGER`', -BigInt(Number.MAX_SAFE_INTEGER) - 1n],
    ])('when passed a %s', (_, value) => {
        it('calls `onIntegerOverflow` with the key path and the value', () => {
            visitNode(value, MOCK_TRAVERSAL_STATE);
            expect(onIntegerOverflow).toHaveBeenCalledWith(MOCK_TRAVERSAL_STATE.keyPath, value);
        });
    });
    it('does not call `onIntegerOverflow` when passed `Number.MAX_SAFE_INTEGER`', () => {
        visitNode(BigInt(Number.MAX_SAFE_INTEGER), MOCK_TRAVERSAL_STATE);
        expect(onIntegerOverflow).not.toHaveBeenCalled();
    });
});
