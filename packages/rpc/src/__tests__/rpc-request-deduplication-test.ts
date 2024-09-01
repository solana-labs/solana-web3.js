import { getSolanaRpcPayloadDeduplicationKey } from '../rpc-request-deduplication';

describe('getSolanaRpcPayloadDeduplicationKey', () => {
    it('produces a key for RPC requests', () => {
        expect(
            getSolanaRpcPayloadDeduplicationKey({
                methodName: 'getFoo',
                params: 'foo',
            }),
        ).toMatchInlineSnapshot(`"["getFoo","foo"]"`);
    });
    it('produces identical keys for two identical RPC requests', () => {
        expect(
            getSolanaRpcPayloadDeduplicationKey({
                methodName: 'getFoo',
                params: { a: 1, b: { c: [2, 3], d: 4 } },
            }),
        ).toEqual(
            getSolanaRpcPayloadDeduplicationKey({
                methodName: 'getFoo',
                params: { a: 1, b: { c: [2, 3], d: 4 } },
            }),
        );
    });
});
