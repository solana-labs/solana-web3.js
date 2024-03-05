import {
    SOLANA_ERROR__ADDRESSES__INVALID_BYTE_LENGTH,
    SOLANA_ERROR__ADDRESSES__STRING_LENGTH_OUT_OF_RANGE,
    SolanaError,
} from '@solana/errors';

import { Address, address } from '../address';

describe('coercions', () => {
    describe('address', () => {
        it('can coerce to `Address`', () => {
            // See scripts/fixtures/GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G.json
            const raw =
                'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G' as Address<'GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G'>;
            const coerced = address('GQE2yjns7SKKuMc89tveBDpzYHwXfeuB2PGAbGaPWc6G');
            expect(coerced).toBe(raw);
        });
        it.each([31, 45])('throws given an address with length %s', actualLength => {
            const thisThrows = () => address('3'.repeat(actualLength));
            expect(thisThrows).toThrow(
                new SolanaError(SOLANA_ERROR__ADDRESSES__STRING_LENGTH_OUT_OF_RANGE, {
                    actualLength,
                }),
            );
        });
        it.each([
            [31, 'tVojvhToWjQ8Xvo4UPx2Xz9eRy7auyYMmZBjc2XfN'],
            [33, 'JJEfe6DcPM2ziB2vfUWDV6aHVerXRGkv3TcyvJUNGHZz'],
        ])('throws given an address that decodes to have %s bytes', (actualLength, badAddress) => {
            const thisThrows = () => address(badAddress);
            expect(thisThrows).toThrow(
                new SolanaError(SOLANA_ERROR__ADDRESSES__INVALID_BYTE_LENGTH, {
                    actualLength,
                }),
            );
        });
    });
});
