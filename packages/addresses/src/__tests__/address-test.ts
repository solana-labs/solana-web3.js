import { VariableSizeEncoder } from '@solana/codecs-core';
import { getBase58Decoder, getBase58Encoder } from '@solana/codecs-strings';
import {
    SOLANA_ERROR__ADDRESSES__INVALID_BYTE_LENGTH,
    SOLANA_ERROR__ADDRESSES__STRING_LENGTH_OUT_OF_RANGE,
    SOLANA_ERROR__CODECS__INVALID_BYTE_LENGTH,
    SolanaError,
} from '@solana/errors';

import { Address, getAddressCodec, getAddressComparator } from '../address';

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

describe('Address', () => {
    describe('assertIsAddress()', () => {
        let assertIsAddress: typeof import('../address').assertIsAddress;
        // Reload `assertIsAddress` before each test to reset memoized state
        beforeEach(async () => {
            await jest.isolateModulesAsync(async () => {
                const base58ModulePromise =
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    import('../address');
                assertIsAddress = (await base58ModulePromise).assertIsAddress;
            });
        });

        describe('using the real base58 implementation', () => {
            beforeEach(() => {
                // use real implementation
                jest.mocked(getBase58Encoder).mockReturnValue(originalGetBase58Encoder);
            });
            it('throws when supplied a non-base58 string', () => {
                expect(() => {
                    assertIsAddress('not-a-base-58-encoded-string');
                }).toThrow(
                    new SolanaError(SOLANA_ERROR__ADDRESSES__STRING_LENGTH_OUT_OF_RANGE, {
                        actualLength: 28,
                    }),
                );
            });
            it('throws when the decoded byte array has a length other than 32 bytes', () => {
                expect(() => {
                    assertIsAddress(
                        // 31 bytes [128, ..., 128]
                        '2xea9jWJ9eca3dFiefTeSPP85c6qXqunCqL2h2JNffM',
                    );
                }).toThrow(
                    new SolanaError(SOLANA_ERROR__ADDRESSES__INVALID_BYTE_LENGTH, {
                        actualLength: 31,
                    }),
                );
            });
            it('does not throw when supplied a base-58 encoded address', () => {
                expect(() => {
                    assertIsAddress('11111111111111111111111111111111');
                }).not.toThrow();
            });
            it('returns undefined when supplied a base-58 encoded address', () => {
                expect(assertIsAddress('11111111111111111111111111111111')).toBeUndefined();
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
                it(`attempts to encode input strings of exactly ${len} characters`, () => {
                    try {
                        assertIsAddress('1'.repeat(len));
                        // eslint-disable-next-line no-empty
                    } catch {}
                    expect(mockEncode).toHaveBeenCalled();
                });
            });
            it('does not attempt to decode too-short input strings', () => {
                try {
                    assertIsAddress(
                        // 31 bytes [0, ..., 0]
                        '1111111111111111111111111111111', // 31 characters
                    );
                    // eslint-disable-next-line no-empty
                } catch {}
                expect(mockEncode).not.toHaveBeenCalled();
            });
            it('does not attempt to decode too-long input strings', () => {
                try {
                    assertIsAddress(
                        // 33 bytes [0, 255, ..., 255]
                        '1JEKNVnkbo3jma5nREBBJCDoXFVeKkD56V3xKrvRmWxFG', // 45 characters
                    );
                    // eslint-disable-next-line no-empty
                } catch {}
                expect(mockEncode).not.toHaveBeenCalled();
            });
            it('memoizes getBase58Encoder when called multiple times', () => {
                try {
                    assertIsAddress('1'.repeat(32));
                    // eslint-disable-next-line no-empty
                } catch {}
                try {
                    assertIsAddress('1'.repeat(32));
                    // eslint-disable-next-line no-empty
                } catch {}
                expect(jest.mocked(getBase58Encoder)).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('getAddressCodec', () => {
        let address: ReturnType<typeof getAddressCodec>;
        beforeEach(() => {
            // use real implementations
            jest.mocked(getBase58Encoder).mockReturnValue(originalGetBase58Encoder);
            jest.mocked(getBase58Decoder).mockReturnValue(originalGetBase58Decoder);

            address = getAddressCodec();
        });
        it('serializes a base58 encoded address into a 32-byte buffer', () => {
            expect(
                address.encode(
                    '4wBqpZM9xaSheZzJSMawUHDgZ7miWfSsxmfVF5jJpYP' as Address<'4wBqpZM9xaSheZzJSMawUKKwhdpChKbZ5eu5ky4Vigw'>,
                ),
            ).toEqual(
                new Uint8Array([
                    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0,
                ]),
            );
        });
        it('deserializes a byte buffer representing an address into a base58 encoded address', () => {
            expect(
                address.decode(
                    new Uint8Array([
                        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
                        27, 28, 29, 30, 31, 32,
                        // Followed by extra bytes not part of the address
                        33, 34,
                    ]),
                ),
            ).toBe(
                '4wBqpZM9xaSheZzJSMawUKKwhdpChKbZ5eu5ky4Vigw' as Address<'4wBqpZM9xaSheZzJSMawUKKwhdpChKbZ5eu5ky4Vigw'>,
            );
        });
        it('fatals when trying to deserialize a byte buffer shorter than 32-bytes', () => {
            const tooShortBuffer = new Uint8Array(Array(31).fill(0));
            expect(() => address.decode(tooShortBuffer)).toThrow(
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
            let getAddressCodec: typeof import('../address').getAddressCodec;
            await jest.isolateModulesAsync(async () => {
                const base58ModulePromise =
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    import('../address');
                getAddressCodec = (await base58ModulePromise).getAddressCodec;
            });

            address = getAddressCodec!();
            address.encode(
                '4wBqpZM9xaSheZzJSMawUHDgZ7miWfSsxmfVF5jJpYP' as Address<'4wBqpZM9xaSheZzJSMawUKKwhdpChKbZ5eu5ky4Vigw'>,
            );

            address = getAddressCodec!();
            address.encode(
                '4wBqpZM9xaSheZzJSMawUHDgZ7miWfSsxmfVF5jJpYP' as Address<'4wBqpZM9xaSheZzJSMawUKKwhdpChKbZ5eu5ky4Vigw'>,
            );

            expect(jest.mocked(getBase58Encoder)).toHaveBeenCalledTimes(1);
            expect(jest.mocked(getBase58Decoder)).toHaveBeenCalledTimes(1);
        });
    });

    describe('getAddressComparator', () => {
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
                ].sort(getAddressComparator()),
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
