import { SolanaJsonRpcIntegerOverflowError } from '../rpc-integer-overflow-error';

describe('SolanaJsonRpcIntegerOverflowError', () => {
    it('features an informative error message', () => {
        expect(new SolanaJsonRpcIntegerOverflowError('someMethod', [2 /* third argument */], 1n)).toMatchInlineSnapshot(
            `[SolanaJsonRpcIntegerOverflowError: The 3rd argument to the \`someMethod\` RPC method was \`1\`. This number is unsafe for use with the Solana JSON-RPC because it exceeds \`Number.MAX_SAFE_INTEGER\`.]`
        );
    });
    it('includes the full path to the value in the error message', () => {
        expect(
            new SolanaJsonRpcIntegerOverflowError('someMethod', [0 /* first argument */, 'foo', 'bar'], 1n)
        ).toMatchInlineSnapshot(
            `[SolanaJsonRpcIntegerOverflowError: The 1st argument to the \`someMethod\` RPC method at path \`foo.bar\` was \`1\`. This number is unsafe for use with the Solana JSON-RPC because it exceeds \`Number.MAX_SAFE_INTEGER\`.]`
        );
    });
    it('exposes the method name, key path, and the value that overflowed', () => {
        expect(new SolanaJsonRpcIntegerOverflowError('someMethod', [0, 'foo', 'bar'], 1n)).toMatchObject({
            keyPath: [0, 'foo', 'bar'],
            methodName: 'someMethod',
            value: 1n,
        });
    });
});
