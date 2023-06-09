import bs58 from 'bs58';

import { assertIsBase58EncodedAddress, getBase58EncodedAddressComparator } from '../base58';

describe('base58', () => {
    describe('assertIsBase58EncodedAddress()', () => {
        it('throws when supplied a non-base58 string', () => {
            expect(() => {
                assertIsBase58EncodedAddress('not-a-base-58-encoded-string');
            }).toThrow();
        });
        it('throws when the decoded byte array has a length other than 32 bytes', () => {
            expect(() => {
                assertIsBase58EncodedAddress(
                    // 31 bytes [128, ..., 128]
                    '2xea9jWJ9eca3dFiefTeSPP85c6qXqunCqL2h2JNffM'
                );
            }).toThrow();
        });
        it('does not throw when supplied a base-58 encoded address', () => {
            expect(() => {
                assertIsBase58EncodedAddress('11111111111111111111111111111111');
            }).not.toThrow();
        });
        it('returns undefined when supplied a base-58 encoded address', () => {
            expect(assertIsBase58EncodedAddress('11111111111111111111111111111111')).toBeUndefined();
        });
        [32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44].forEach(len => {
            it(`attempts to decode input strings of exactly ${len} characters`, () => {
                const decodeMethod = jest.spyOn(bs58, 'decode');
                try {
                    assertIsBase58EncodedAddress('1'.repeat(len));
                    // eslint-disable-next-line no-empty
                } catch {}
                expect(decodeMethod).toHaveBeenCalled();
            });
        });
        it('does not attempt to decode too-short input strings', () => {
            const decodeMethod = jest.spyOn(bs58, 'decode');
            try {
                assertIsBase58EncodedAddress(
                    // 31 bytes [0, ..., 0]
                    '1111111111111111111111111111111' // 31 characters
                );
                // eslint-disable-next-line no-empty
            } catch {}
            expect(decodeMethod).not.toHaveBeenCalled();
        });
        it('does not attempt to decode too-long input strings', () => {
            const decodeMethod = jest.spyOn(bs58, 'decode');
            try {
                assertIsBase58EncodedAddress(
                    // 33 bytes [0, 255, ..., 255]
                    '1JEKNVnkbo3jma5nREBBJCDoXFVeKkD56V3xKrvRmWxFG' // 45 characters
                );
                // eslint-disable-next-line no-empty
            } catch {}
            expect(decodeMethod).not.toHaveBeenCalled();
        });
    });
    describe('getBase58EncodedAddressComparator', () => {
        it('sorts base 58 addresses', () => {
            expect(
                // These addresses were chosen such that sorting these conventionally (ie. using
                // the default `Array.sort`) or numerically (ie. on the basis of the underlying
                // numerical value of the address) would fail to produce the expected output. This
                // exercises the 'specialness' of the base 58 encoded address comparator.
                [
                    'Ht1VrhoyhwMGMpBBi89BPdJp5R39Mu49suKx3A22W9Qs',
                    'J9ZSLc9qPg3FR8UqfN6ae1QkVReUmnpLgQqFkGEPqmod',
                    '6JYSQqSHY1E5JDwEfgWMieozqA1KCwiP2cH69to9eWKH',
                    '7YR1xA7yzFAT4yQCsS4rpowjU1tsh5YUJd9hWMHRppcX',
                    '7grJ9YUAEHxckLFqCY7fq8cM1UrragNSuPH1dvwJ8EEK',
                    'AJBPNWCjVLwxff2eJynW56cMRCGmyU4y3vbuvtVdgVgb',
                    'B8A2zUEDtJjR7nrokNUJYhgUQiwEBzC88rZc6WUE5ZeF',
                    'BKggsVVp7yLmXtPuBDtC3FXBzvLyyye3Q2tFKUUGCHLj',
                    'Ds72joawSKQ9nCDAAmGMKFiwiY6HR7PDzYDHDzZom3tj',
                    'F1zKr4ZUYo5UAnH1fvYaD6R7ne137NYfS1r5HrCb8NpF',
                ].sort(getBase58EncodedAddressComparator())
            ).toEqual([
                '6JYSQqSHY1E5JDwEfgWMieozqA1KCwiP2cH69to9eWKH',
                '7grJ9YUAEHxckLFqCY7fq8cM1UrragNSuPH1dvwJ8EEK',
                '7YR1xA7yzFAT4yQCsS4rpowjU1tsh5YUJd9hWMHRppcX',
                'AJBPNWCjVLwxff2eJynW56cMRCGmyU4y3vbuvtVdgVgb',
                'B8A2zUEDtJjR7nrokNUJYhgUQiwEBzC88rZc6WUE5ZeF',
                'BKggsVVp7yLmXtPuBDtC3FXBzvLyyye3Q2tFKUUGCHLj',
                'Ds72joawSKQ9nCDAAmGMKFiwiY6HR7PDzYDHDzZom3tj',
                'F1zKr4ZUYo5UAnH1fvYaD6R7ne137NYfS1r5HrCb8NpF',
                'Ht1VrhoyhwMGMpBBi89BPdJp5R39Mu49suKx3A22W9Qs',
                'J9ZSLc9qPg3FR8UqfN6ae1QkVReUmnpLgQqFkGEPqmod',
            ]);
        });
    });
});
