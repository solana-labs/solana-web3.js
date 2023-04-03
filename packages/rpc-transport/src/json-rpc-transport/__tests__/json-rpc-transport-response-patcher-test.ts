import { createJsonRpcTransport } from '..';
import { makeHttpRequest } from '../../http-request';
import { Transport } from '../json-rpc-transport-types';
import { patchResponseForSolanaLabsRpc } from '../../response-patcher';

jest.mock('../../http-request');
jest.mock('../../response-patcher');

interface TestRpcApi {
    someMethod(...args: unknown[]): unknown;
}

// FIXME(solana-labs/solana/issues/30341) The JSON RPC was designed to communicate JavaScript
// `Numbers` over the wire, which puts values over `Number.MAX_SAFE_INTEGER` at risk of rounding
// errors. This test ensures that the response patcher is called.
describe('Solana JSON-RPC response patcher', () => {
    let transport: Transport<TestRpcApi>;
    const url = 'fake://url';
    beforeEach(() => {
        transport = createJsonRpcTransport({ url });
    });
    it('calls the response patcher with the response and the method name', async () => {
        expect.assertions(1);
        (makeHttpRequest as jest.Mock).mockResolvedValueOnce({ result: 456 });
        await transport.someMethod(123).send();
        expect(patchResponseForSolanaLabsRpc).toHaveBeenCalledWith(456, 'someMethod');
    });
});
