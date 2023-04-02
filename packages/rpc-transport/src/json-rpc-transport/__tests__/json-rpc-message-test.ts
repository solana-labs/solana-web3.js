import { createJsonRpcMessage } from '../json-rpc-message';

describe('createJsonRpcMessage', () => {
    it('auto-increments ids with each new message', () => {
        const { id: firstId } = createJsonRpcMessage('foo', 'bar');
        const { id: secondId } = createJsonRpcMessage('foo', 'bar');
        expect(secondId - firstId).toBe(1);
    });
    it('returns a well-formed JSON-RPC 2.0 message', () => {
        const params = [1, 2, 3];
        expect(createJsonRpcMessage('someMethod', params)).toStrictEqual({
            id: expect.any(Number),
            jsonrpc: '2.0',
            method: 'someMethod',
            params,
        });
    });
});
