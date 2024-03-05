import { SOLANA_ERROR__RPC__INTEGER_OVERFLOW, SolanaError } from '@solana/errors';

import { createSolanaJsonRpcIntegerOverflowError } from '../rpc-integer-overflow-error';

describe('createSolanaJsonRpcIntegerOverflowError()', () => {
    it('creates a `SolanaError`', () => {
        const error = createSolanaJsonRpcIntegerOverflowError('someMethod', [2 /* third argument */], 1n);
        expect(error).toBeInstanceOf(SolanaError);
    });
    it('creates a `SolanaError` with the code `SOLANA_ERROR__RPC__INTEGER_OVERFLOW`', () => {
        const error = createSolanaJsonRpcIntegerOverflowError('someMethod', [2 /* third argument */], 1n);
        expect(error).toHaveProperty('context.__code', SOLANA_ERROR__RPC__INTEGER_OVERFLOW);
    });
    it('creates a `SolanaError` with the correct context for a path-less violation', () => {
        const error = createSolanaJsonRpcIntegerOverflowError('someMethod', [2 /* third argument */], 1n);
        expect(error).toEqual(
            new SolanaError(SOLANA_ERROR__RPC__INTEGER_OVERFLOW, {
                argumentLabel: '3rd',
                keyPath: [2],
                methodName: 'someMethod',
                optionalPathLabel: '',
                value: 1n,
            }),
        );
    });
    it('creates a `SolanaError` with the correct context for a violation with a deep path', () => {
        const error = createSolanaJsonRpcIntegerOverflowError('someMethod', [0 /* first argument */, 'foo', 'bar'], 1n);
        expect(error).toHaveProperty('context.optionalPathLabel', ' at path `foo.bar`');
        expect(error).toHaveProperty('context.path', 'foo.bar');
    });
    it('omits the error factory function itself from the stack trace', () => {
        const error = createSolanaJsonRpcIntegerOverflowError('someMethod', [0 /* first argument */, 'foo', 'bar'], 1n);
        expect(error.stack).not.toMatch(/createSolanaJsonRpcIntegerOverflowError/);
    });
    it.each(
        Object.entries({
            ...(() => {
                const out: Record<number, string> = {};
                Array.from({ length: 100 }).forEach((_, ii) => {
                    const lastDigit = ii % 10;
                    // eslint-disable-next-line jest/no-conditional-in-test
                    if (lastDigit === 0) {
                        out[ii] = `${ii + 1}st`;
                        // eslint-disable-next-line jest/no-conditional-in-test
                    } else if (lastDigit === 1) {
                        out[ii] = `${ii + 1}nd`;
                        // eslint-disable-next-line jest/no-conditional-in-test
                    } else if (lastDigit === 2) {
                        out[ii] = `${ii + 1}rd`;
                    } else {
                        out[ii] = `${ii + 1}th`;
                    }
                });
                return out;
            })(),
            10: '11th',
            11: '12th',
            12: '13th',
        }),
    )('computes the correct ordinal when crafting the argument label', (index, expectedLabel) => {
        const error = createSolanaJsonRpcIntegerOverflowError('someMethod', [parseInt(index, 10)], 1n);
        expect(error).toHaveProperty('context.argumentLabel', expectedLabel);
    });
});
