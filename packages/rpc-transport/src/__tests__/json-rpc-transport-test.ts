import { IJsonRpcTransport } from '..';
import { makeHttpRequest } from '../http-request';
import { SolanaJsonRpcError } from '../json-rpc-errors';
import { createJsonRpcTransport } from '../json-rpc-transport';

jest.mock('../http-request');

describe('JSON-RPC 2.0 transport', () => {
    let transport: IJsonRpcTransport;
    beforeEach(() => {
        transport = createJsonRpcTransport({ url: 'fake://url' });
        (makeHttpRequest as jest.Mock).mockImplementation(
            () =>
                new Promise(_ => {
                    /* never resolve */
                })
        );
    });
    it('returns results from a JSON-RPC 2.0 endpoint', async () => {
        expect.assertions(1);
        (makeHttpRequest as jest.Mock).mockResolvedValueOnce({ result: 123 });
        const result = await transport.send('someMethod', undefined);
        expect(result).toBe(123);
    });
    it('throws errors from a JSON-RPC 2.0 endpoint', async () => {
        expect.assertions(3);
        (makeHttpRequest as jest.Mock).mockResolvedValueOnce({ error: { code: 123, data: 'abc', message: 'o no' } });
        const sendPromise = transport.send('someMethod', undefined);
        await expect(sendPromise).rejects.toThrow(SolanaJsonRpcError);
        await expect(sendPromise).rejects.toThrow(/o no/);
        await expect(sendPromise).rejects.toMatchObject({ code: 123, data: 'abc' });
    });
});
