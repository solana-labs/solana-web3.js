import type { VariableSizeEncoder } from '@solana/codecs-core';
import { getBase58Decoder, getBase58Encoder } from '@solana/codecs-strings';
import {
    SOLANA_ERROR__BLOCKHASH_STRING_LENGTH_OUT_OF_RANGE,
    SOLANA_ERROR__CODECS__INVALID_BYTE_LENGTH,
    SOLANA_ERROR__CODECS__INVALID_STRING_FOR_BASE,
    SOLANA_ERROR__INVALID_BLOCKHASH_BYTE_LENGTH,
    SolanaError,
} from '@solana/errors';

import { Blockhash, getBlockhashCodec, getBlockhashComparator } from '../blockhash';

jest.mock('@solana/codecs-strings', () => ({
    ...jest.requireActual('@solana/codecs-strings'),
    getBase58Decoder: jest.fn(),
    getBase58Encoder: jest.fn(),
}));
// HACK: Pierce the veil of `jest.isolateModules` so that the modules inside get the same version of
//       `@solana/errors` that is imported above.
jest.mock('@solana/errors', () => jest.requireActual('@solana/errors'));

// real implementations
const originalBase58Module = jest.requireActual('@solana/codecs-strings');
const originalGetBase58Encoder = originalBase58Module.getBase58Encoder();
const originalGetBase58Decoder = originalBase58Module.getBase58Decoder();

describe('assertIsBlockhash()', () => {
    let assertIsBlockhash: typeof import('../blockhash').assertIsBlockhash;
    // Reload `assertIsBlockhash` before each test to reset memoized state
    beforeEach(async () => {
        await jest.isolateModulesAsync(async () => {
            const base58ModulePromise =
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                import('../blockhash');
            assertIsBlockhash = (await base58ModulePromise).assertIsBlockhash;
        });
    });

    describe('using the real base58 implementation', () => {
        beforeEach(() => {
            // use real implementation
            jest.mocked(getBase58Encoder).mockReturnValue(originalGetBase58Encoder);
        });

        it('throws when supplied a non-base58 string', () => {
            const badBlockhash = 'not-a-base-58-encoded-string-but-nice-try';
            expect(() => {
                assertIsBlockhash(badBlockhash);
            }).toThrow(
                new SolanaError(SOLANA_ERROR__CODECS__INVALID_STRING_FOR_BASE, {
                    alphabet: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
                    base: 58,
                    value: badBlockhash,
                }),
            );
        });
        it.each([31, 45])('throws when the encoded string is of length %s', actualLength => {
            const badBlockhash = '1'.repeat(actualLength);
            expect(() => {
                assertIsBlockhash(badBlockhash);
            }).toThrow(
                new SolanaError(SOLANA_ERROR__BLOCKHASH_STRING_LENGTH_OUT_OF_RANGE, {
                    actualLength,
                }),
            );
        });
        it.each([
            [31, 'tVojvhToWjQ8Xvo4UPx2Xz9eRy7auyYMmZBjc2XfN'],
            [33, 'JJEfe6DcPM2ziB2vfUWDV6aHVerXRGkv3TcyvJUNGHZz'],
        ])('throws when the decoded byte array has a length of %s bytes', (actualLength, badBlockhash) => {
            expect(() => {
                assertIsBlockhash(badBlockhash);
            }).toThrow(
                new SolanaError(SOLANA_ERROR__INVALID_BLOCKHASH_BYTE_LENGTH, {
                    actualLength,
                }),
            );
        });
        it('does not throw when supplied a base-58 encoded hash', () => {
            expect(() => {
                assertIsBlockhash('11111111111111111111111111111111');
            }).not.toThrow();
        });
        it('returns undefined when supplied a base-58 encoded hash', () => {
            expect(assertIsBlockhash('11111111111111111111111111111111')).toBeUndefined();
        });
    });

    describe('using a mock base58 implementation', () => {
        const mockEncode = jest.fn();
        beforeEach(() => {
            // use mock implementation
            mockEncode.mockClear();
            jest.mocked(getBase58Encoder).mockReturnValue({
                encode: mockEncode,
            } as unknown as VariableSizeEncoder<string>);
        });

        [32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44].forEach(len => {
            it(`attempts to decode input strings of exactly ${len} characters`, () => {
                try {
                    assertIsBlockhash('1'.repeat(len));
                    // eslint-disable-next-line no-empty
                } catch {}
                expect(mockEncode).toHaveBeenCalledTimes(1);
            });
        });
        it('does not attempt to decode too-short input strings', () => {
            try {
                assertIsBlockhash(
                    // 31 bytes [0, ..., 0]
                    '1111111111111111111111111111111', // 31 characters
                );
                // eslint-disable-next-line no-empty
            } catch {}
            expect(mockEncode).not.toHaveBeenCalled();
        });
        it('does not attempt to decode too-long input strings', () => {
            try {
                assertIsBlockhash(
                    // 33 bytes [0, 255, ..., 255]
                    '1JEKNVnkbo3jma5nREBBJCDoXFVeKkD56V3xKrvRmWxFG', // 45 characters
                );
                // eslint-disable-next-line no-empty
            } catch {}
            expect(mockEncode).not.toHaveBeenCalled();
        });
        it('memoizes getBase58Encoder when called multiple times', () => {
            try {
                assertIsBlockhash('1'.repeat(32));
                // eslint-disable-next-line no-empty
            } catch {}
            try {
                assertIsBlockhash('1'.repeat(32));
                // eslint-disable-next-line no-empty
            } catch {}
            expect(jest.mocked(getBase58Encoder)).toHaveBeenCalledTimes(1);
        });
    });

    describe('getBlockhashCodec', () => {
        let blockhash: ReturnType<typeof getBlockhashCodec>;
        beforeEach(() => {
            // use real implementations
            jest.mocked(getBase58Encoder).mockReturnValue(originalGetBase58Encoder);
            jest.mocked(getBase58Decoder).mockReturnValue(originalGetBase58Decoder);

            blockhash = getBlockhashCodec();
        });
        it('serializes a base58 encoded blockhash into a 32-byte buffer', () => {
            expect(blockhash.encode('4wBqpZM9xaSheZzJSMawUHDgZ7miWfSsxmfVF5jJpYP' as Blockhash)).toEqual(
                new Uint8Array([
                    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0,
                ]),
            );
        });
        it('deserializes a byte buffer representing an blockhash into a base58 encoded blockhash', () => {
            expect(
                blockhash.decode(
                    new Uint8Array([
                        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
                        27, 28, 29, 30, 31, 32,
                        // Followed by extra bytes not part of the blockhash
                        33, 34,
                    ]),
                ),
            ).toBe('4wBqpZM9xaSheZzJSMawUKKwhdpChKbZ5eu5ky4Vigw' as Blockhash);
        });
        it('fatals when trying to deserialize a byte buffer shorter than 32-bytes', () => {
            const tooShortBuffer = new Uint8Array(Array(31).fill(0));
            expect(() => blockhash.decode(tooShortBuffer)).toThrow(
                new SolanaError(SOLANA_ERROR__CODECS__INVALID_BYTE_LENGTH, {
                    bytesLength: 31,
                    codecDescription: 'fixCodecSize',
                    expected: 32,
                }),
            );
        });
        it('memoizes getBase58Encoder and getBase58Decoder when called multiple times', async () => {
            expect.assertions(2);

            // reload the module to reset memoized state
            let getBlockhashCodec: typeof import('../blockhash').getBlockhashCodec;
            await jest.isolateModulesAsync(async () => {
                const base58ModulePromise =
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    import('../blockhash');
                getBlockhashCodec = (await base58ModulePromise).getBlockhashCodec;
            });

            blockhash = getBlockhashCodec!();
            blockhash.encode('4wBqpZM9xaSheZzJSMawUHDgZ7miWfSsxmfVF5jJpYP' as Blockhash);

            blockhash = getBlockhashCodec!();
            blockhash.encode('4wBqpZM9xaSheZzJSMawUHDgZ7miWfSsxmfVF5jJpYP' as Blockhash);

            expect(jest.mocked(getBase58Encoder)).toHaveBeenCalledTimes(1);
            expect(jest.mocked(getBase58Decoder)).toHaveBeenCalledTimes(1);
        });
    });

    describe('getAddressComparator', () => {
        it('sorts base 58 blockhashes', () => {
            expect(
                // These blockhashes were chosen such that sorting these conventionally (ie. using
                // the default `Array.sort`) or numerically (ie. on the basis of the underlying
                // numerical value of the blockhash) would fail to produce the expected output. This
                // exercises the 'specialness' of the base 58 encoded blockhash comparator.
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
                ].sort(getBlockhashComparator()),
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
