import { TransactionVersion } from '../../types';
import { transactionVersionHeader } from '../transaction-version';

const VERSION_FLAG_MASK = 0x80;
const VERSION_TEST_CASES = // Versions 0–127
    [...Array(128).keys()].map(version => [version | VERSION_FLAG_MASK, version as TransactionVersion] as const);
describe('Transaction version serializer', () => {
    it('serializes no data when the version is `legacy`', () => {
        expect(transactionVersionHeader.serialize('legacy')).toEqual(new Uint8Array());
    });
    it.each(VERSION_TEST_CASES)('serializes to `%s` when the version is `%s`', (expected, version) => {
        expect(transactionVersionHeader.serialize(version)).toEqual(new Uint8Array([expected]));
    });
    it.each(VERSION_TEST_CASES)('deserializes `%s` to the version `%s`', (byte, expected) => {
        expect(transactionVersionHeader.deserialize(new Uint8Array([byte]))[0]).toEqual(expected);
    });
    it('deserializes to `legacy` when missing the version flag', () => {
        expect(
            transactionVersionHeader.deserialize(
                // eg. just a byte that indicates that there are 3 required signers
                new Uint8Array([3])
            )[0]
        ).toBe('legacy');
    });
    it.each([-1 as TransactionVersion, 128 as TransactionVersion])(
        'throws when passed the out-of-range version `%s`',
        version => {
            expect(() => transactionVersionHeader.serialize(version)).toThrow();
        }
    );
});
