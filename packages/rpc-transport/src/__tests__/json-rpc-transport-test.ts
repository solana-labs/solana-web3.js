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
});
