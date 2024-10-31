import { createRpcMessage } from '../rpc-message';

describe('createRpcMessage', () => {
    it('auto-increments ids with each new message', () => {
        const request = { methodName: 'foo', params: 'bar' };
        const { id: firstId } = createRpcMessage(request);
        const { id: secondId } = createRpcMessage(request);
        expect(Number(secondId) - Number(firstId)).toBe(1);
    });
    it('returns a well-formed JSON-RPC 2.0 message', () => {
        const request = { methodName: 'someMethod', params: [1, 2, 3] };
        expect(createRpcMessage(request)).toStrictEqual({
            id: expect.any(String),
            jsonrpc: '2.0',
            method: 'someMethod',
            params: [1, 2, 3],
        });
    });
});
