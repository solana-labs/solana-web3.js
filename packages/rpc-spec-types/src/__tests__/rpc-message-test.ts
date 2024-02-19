import { createRpcMessage } from '../rpc-message';

describe('createRpcMessage', () => {
    it('auto-increments ids with each new message', () => {
        const { id: firstId } = createRpcMessage('foo', 'bar');
        const { id: secondId } = createRpcMessage('foo', 'bar');
        expect(secondId - firstId).toBe(1);
    });
    it('returns a well-formed JSON-RPC 2.0 message', () => {
        const params = [1, 2, 3];
        expect(createRpcMessage('someMethod', params)).toStrictEqual({
            id: expect.any(Number),
            jsonrpc: '2.0',
            method: 'someMethod',
            params,
        });
    });
});
