import { IJsonRpcTransport } from '..';
import { SolanaJsonRpcError } from '../json-rpc-errors';
import { createJsonRpcTransport } from '../json-rpc-transport';

import fetchMock from 'jest-fetch-mock';

describe('JSON-RPC 2.0 transport', () => {
    let transport: IJsonRpcTransport;
    beforeEach(() => {
        transport = createJsonRpcTransport({ url: 'fake://url' });
    });
    it('returns results from a JSON-RPC 2.0 endpoint', async () => {
        expect.assertions(1);
        fetchMock.once(JSON.stringify({ result: 123 }));
        const result = await transport.send('someMethod', undefined);
        expect(result).toBe(123);
    });
    it('throws errors from a JSON-RPC 2.0 endpoint', async () => {
        expect.assertions(3);
        fetchMock.once(JSON.stringify({ error: { code: 123, data: 'abc', message: 'o no' } }));
        const sendPromise = transport.send('someMethod', undefined);
        await expect(sendPromise).rejects.toThrow(SolanaJsonRpcError);
        await expect(sendPromise).rejects.toThrow(/o no/);
        await expect(sendPromise).rejects.toMatchObject({ code: 123, data: 'abc' });
    });
    // FIXME(solana-labs/solana/issues/30341) The JSON RPC was designed to communicate JavaScript
    // `Numbers` over the wire, which puts values over `Number.MAX_SAFE_INTEGER` at risk of rounding
    // errors. This test exercises the warning handler for such integer overflows.
    describe('with respect to possible integer overflows', () => {
        let onIntegerOverflow: jest.Mock;
        let transport: IJsonRpcTransport;
        beforeEach(() => {
            onIntegerOverflow = jest.fn();
        });
        describe('given a transport configured without an `onIntegerOverflow` function', () => {
            beforeEach(() => {
                transport = createJsonRpcTransport({ url: 'fake://url' });
            });
            it('does not call `onIntegerOverflow` when passed a value above `Number.MAX_SAFE_INTEGER`', async () => {
                expect.assertions(2);
                fetchMock.once(JSON.stringify({ result: 123 }));
                const result = await transport.send('someMethod', BigInt(Number.MAX_SAFE_INTEGER) + 1n);
                expect(onIntegerOverflow).not.toHaveBeenCalled();
                expect(result).toBe(123);
            });
        });
        describe('given a transport configured with an `onIntegerOverflow` function', () => {
            beforeEach(() => {
                transport = createJsonRpcTransport({ onIntegerOverflow, url: 'fake://url' });
            });
            it('calls `onIntegerOverflow` when passed a value above `Number.MAX_SAFE_INTEGER`', async () => {
                expect.assertions(2);
                fetchMock.once(JSON.stringify({ result: 123 }));
                const result = await transport.send('someMethod', BigInt(Number.MAX_SAFE_INTEGER) + 1n);
                expect(onIntegerOverflow).toHaveBeenCalledWith('someMethod', [], BigInt(Number.MAX_SAFE_INTEGER) + 1n);
                expect(result).toBe(123);
            });
            it('calls `onIntegerOverflow` when passed a nested array having a value above `Number.MAX_SAFE_INTEGER`', async () => {
                expect.assertions(2);
                fetchMock.once(JSON.stringify({ result: 123 }));
                const result = await transport.send('someMethod', [1, 2, [3, BigInt(Number.MAX_SAFE_INTEGER) + 1n]]);
                expect(onIntegerOverflow).toHaveBeenCalledWith(
                    'someMethod',
                    [2, 1], // Equivalent to `params[2][1]`.
                    BigInt(Number.MAX_SAFE_INTEGER) + 1n
                );
                expect(result).toBe(123);
            });
            it('calls `onIntegerOverflow` when passed a nested object having a value above `Number.MAX_SAFE_INTEGER`', async () => {
                expect.assertions(2);
                fetchMock.once(JSON.stringify({ result: 123 }));
                const result = await transport.send('someMethod', {
                    a: 1,
                    b: { b1: 2, b2: BigInt(Number.MAX_SAFE_INTEGER) + 1n },
                });
                expect(onIntegerOverflow).toHaveBeenCalledWith(
                    'someMethod',
                    ['b', 'b2'], // Equivalent to `params.b.b2`.
                    BigInt(Number.MAX_SAFE_INTEGER) + 1n
                );
                expect(result).toBe(123);
            });
            it('does not call `onIntegerOverflow` when passed `Number.MAX_SAFE_INTEGER`', async () => {
                expect.assertions(2);
                fetchMock.once(JSON.stringify({ result: 123 }));
                const result = await transport.send('someMethod', BigInt(Number.MAX_SAFE_INTEGER));
                expect(onIntegerOverflow).not.toHaveBeenCalled();
                expect(result).toBe(123);
            });
        });
    });
});
