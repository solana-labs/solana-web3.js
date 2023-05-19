import bs58 from 'bs58';

import { assertIsTransactionSignature } from '../transaction-signature';

describe('assertIsTransactionSignature()', () => {
    it('throws when supplied a non-base58 string', () => {
        expect(() => {
            assertIsTransactionSignature('not-a-base-58-encoded-string');
        }).toThrow();
    });
    it('throws when the decoded byte array has a length other than 32 bytes', () => {
        expect(() => {
            assertIsTransactionSignature(
                // 63 bytes [128, ..., 128]
                '1'.repeat(63)
            );
        }).toThrow();
    });
    it('does not throw when supplied a base-58 encoded signature', () => {
        expect(() => {
            // 64 bytes [0, ..., 0]
            assertIsTransactionSignature('1'.repeat(64));

            // example signatures
            assertIsTransactionSignature(
                '5HkW5GttYoahVHaujuxEyfyq7RwvoKpc94ko5Fq9GuYdyhejg9cHcqm1MjEvHsjaADRe6hVBqB2E4RQgGgxeA2su'
            );
            assertIsTransactionSignature(
                '2VZm7DkqSKaHxsGiAuVuSkvEbGWf7JrfRdPTw42WKuJC8qw7yQbGL5AE7UxHH3tprgmT9EVbambnK9h3PLpvMvES'
            );
            assertIsTransactionSignature(
                '5sXRtm61WrRGRTjJ6f2anKUWt86Y4V9gWU4WUpue4T4Zh6zuvFoSyaX5LkEtChfqVC8oHdqLo2eUXbhVduThBdfG'
            );
            assertIsTransactionSignature(
                '2Dy6Qai5JyChoP4BKoh9KAYhpD96CUhmEce1GJ8HpV5h8Q4CgUt8KZQzhVNDEQYcjARxYyBNhNjhKUGC2XLZtCCm'
            );
        }).not.toThrow();
    });
    it('returns undefined when supplied a base-58 encoded signature', () => {
        // 64 bytes [0, ..., 0]
        expect(assertIsTransactionSignature('1'.repeat(64))).toBeUndefined();
    });
    [64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88].forEach(
        len => {
            it(`attempts to decode input strings of exactly ${len} characters`, () => {
                const decodeMethod = jest.spyOn(bs58, 'decode');
                try {
                    assertIsTransactionSignature('1'.repeat(len));
                    // eslint-disable-next-line no-empty
                } catch {}
                expect(decodeMethod).toHaveBeenCalled();
            });
        }
    );
    it('does not attempt to decode too-short input strings', () => {
        const decodeMethod = jest.spyOn(bs58, 'decode');
        try {
            assertIsTransactionSignature(
                // 63 bytes [0, ..., 0]
                '1'.repeat(63)
            );
            // eslint-disable-next-line no-empty
        } catch {}
        expect(decodeMethod).not.toHaveBeenCalled();
    });
    it('does not attempt to decode too-long input strings', () => {
        const decodeMethod = jest.spyOn(bs58, 'decode');
        try {
            assertIsTransactionSignature(
                // 65 bytes [0, 255, ..., 255]
                '167rpwLCuS5DGA8KGZXKsVQ7dnPb9goRLoKfgGbLfQg9WoLUgNY77E2jT11fem3coV9nAkguBACzrU1iyZM4B8roQ'
            );
            // eslint-disable-next-line no-empty
        } catch {}
        expect(decodeMethod).not.toHaveBeenCalled();
    });
});
