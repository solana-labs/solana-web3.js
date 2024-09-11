import { isJsonRpcPayload } from '../rpc-transport';

describe('isJsonRpcPayload', () => {
    it('recognizes JSON RPC payloads', () => {
        expect(isJsonRpcPayload({ jsonrpc: '2.0', method: 'getFoo', params: [123] })).toBe(true);
    });
    it('returns false if the payload is not an object', () => {
        expect(isJsonRpcPayload(undefined)).toBe(false);
        expect(isJsonRpcPayload(null)).toBe(false);
        expect(isJsonRpcPayload(true)).toBe(false);
        expect(isJsonRpcPayload(false)).toBe(false);
        expect(isJsonRpcPayload([])).toBe(false);
        expect(isJsonRpcPayload('o hai')).toBe(false);
        expect(isJsonRpcPayload(123)).toBe(false);
        expect(isJsonRpcPayload(123n)).toBe(false);
    });
    it('returns false if the payload is an empty object', () => {
        expect(isJsonRpcPayload({})).toBe(false);
    });
    it('returns false if the payload is not a JSON RPC v2', () => {
        expect(isJsonRpcPayload({ jsonrpc: '42.0', method: 'getFoo', params: [123] })).toBe(false);
    });
    it('returns false if the method name is missing', () => {
        expect(isJsonRpcPayload({ jsonrpc: '2.0', params: [123] })).toBe(false);
    });
    it('returns false if the parameters are missing', () => {
        expect(isJsonRpcPayload({ jsonrpc: '2.0', method: 'getFoo' })).toBe(false);
    });
});
