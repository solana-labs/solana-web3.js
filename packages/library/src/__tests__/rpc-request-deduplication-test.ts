import { getSolanaRpcPayloadDeduplicationKey } from '../rpc-request-deduplication';

describe('getSolanaRpcPayloadDeduplicationKey', () => {
    it('produces no key for undefined payloads', () => {
        expect(getSolanaRpcPayloadDeduplicationKey(undefined)).toBeUndefined();
    });
    it('produces no key for null payloads', () => {
        expect(getSolanaRpcPayloadDeduplicationKey(null)).toBeUndefined();
    });
    it('produces no key for array payloads', () => {
        expect(getSolanaRpcPayloadDeduplicationKey([])).toBeUndefined();
    });
    it('produces no key for string payloads', () => {
        expect(getSolanaRpcPayloadDeduplicationKey('o hai')).toBeUndefined();
    });
    it('produces no key for numeric payloads', () => {
        expect(getSolanaRpcPayloadDeduplicationKey(123)).toBeUndefined();
    });
    it('produces no key for bigint payloads', () => {
        expect(getSolanaRpcPayloadDeduplicationKey(123n)).toBeUndefined();
    });
    it('produces no key for object payloads that are not JSON-RPC payloads', () => {
        expect(getSolanaRpcPayloadDeduplicationKey({})).toBeUndefined();
    });
    it('produces a key for a JSON-RPC payload', () => {
        expect(
            getSolanaRpcPayloadDeduplicationKey({
                id: 1,
                jsonrpc: '2.0',
                method: 'getFoo',
                params: 'foo',
            }),
        ).toMatchInlineSnapshot(`"["getFoo","foo"]"`);
    });
    it('produces identical keys for two materially identical JSON-RPC payloads', () => {
        expect(
            getSolanaRpcPayloadDeduplicationKey({
                id: 1,
                jsonrpc: '2.0',
                method: 'getFoo',
                params: { a: 1, b: { c: [2, 3], d: 4 } },
            }),
        ).toEqual(
            /* eslint-disable sort-keys-fix/sort-keys-fix */
            getSolanaRpcPayloadDeduplicationKey({
                jsonrpc: '2.0',
                method: 'getFoo',
                params: { b: { d: 4, c: [2, 3] }, a: 1 },
                id: 2,
            }),
            /* eslint-enable sort-keys-fix/sort-keys-fix */
        );
    });
});
