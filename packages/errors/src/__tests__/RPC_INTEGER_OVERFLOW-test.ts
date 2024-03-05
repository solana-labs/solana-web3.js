import { SOLANA_ERROR__RPC__INTEGER_OVERFLOW } from '../codes';
import { SolanaError } from '../error';

describe('SOLANA_ERROR__RPC__INTEGER_OVERFLOW', () => {
    beforeEach(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).__DEV__ = true;
    });
    it('features an informative error message for a path-less violation', () => {
        expect(
            new SolanaError(SOLANA_ERROR__RPC__INTEGER_OVERFLOW, {
                argumentLabel: '3rd',
                keyPath: [2 /* third argument */],
                methodName: 'someMethod',
                optionalPathLabel: '',
                value: 1n,
            }),
        ).toHaveProperty(
            'message',
            'The 3rd argument to the `someMethod` RPC method was `1`. This number is unsafe for use with the Solana JSON-RPC because it exceeds `Number.MAX_SAFE_INTEGER`.',
        );
    });
    it('features an informative error message for a violation with a deep path', () => {
        expect(
            new SolanaError(SOLANA_ERROR__RPC__INTEGER_OVERFLOW, {
                argumentLabel: '1st',
                keyPath: [0 /* first argument */, 'foo', 'bar'],
                methodName: 'someMethod',
                optionalPathLabel: ' at path `foo.bar`',
                path: 'foo.bar',
                value: 1n,
            }),
        ).toHaveProperty(
            'message',
            'The 1st argument to the `someMethod` RPC method at path `foo.bar` was `1`. This number is unsafe for use with the Solana JSON-RPC because it exceeds `Number.MAX_SAFE_INTEGER`.',
        );
    });
});
