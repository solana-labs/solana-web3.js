import type { VariableSizeEncoder } from '@solana/codecs-core';
import { getBase58Encoder } from '@solana/codecs-strings';
import {
    SOLANA_ERROR__INVALID_BLOCKHASH_BYTE_LENGTH,
    SOLANA_ERROR__BLOCKHASH_STRING_LENGTH_OUT_OF_RANGE,
    SOLANA_ERROR__CODECS_INVALID_STRING_FOR_BASE,
    SolanaError,
} from '@solana/errors';

jest.mock('@solana/codecs-strings', () => ({
    ...jest.requireActual('@solana/codecs-strings'),
    getBase58Encoder: jest.fn(),
}));

// real implementations
const originalBase58Module = jest.requireActual('@solana/codecs-strings');
const originalGetBase58Encoder = originalBase58Module.getBase58Encoder();

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
                new SolanaError(SOLANA_ERROR__CODECS_INVALID_STRING_FOR_BASE, {
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
});
