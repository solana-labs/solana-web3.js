import { SOLANA_ERROR__CODECS__OFFSET_OUT_OF_RANGE, SolanaError } from '@solana/errors';

import { offsetCodec } from '../offset-codec';
import { b, expectNewPostOffset, expectNewPreOffset, getMockCodec } from './__setup__';

describe('offsetCodec', () => {
    describe('with relative offsets', () => {
        it('keeps the same pre-offset', () => {
            const mockCodec = getMockCodec({ innerSize: 4, size: 10 });
            const codec = offsetCodec(mockCodec, { preOffset: ({ preOffset }) => preOffset });
            expectNewPreOffset(codec, mockCodec, /* preOffset */ 3, /* newPreOffset */ 3);
            // Before: 0x000000[pre=3]ffffffff000000
            // After:  0x000000[pre=3]ffffffff000000
        });

        it('keeps the same post-offset', () => {
            const mockCodec = getMockCodec({ innerSize: 4, size: 10 });
            const codec = offsetCodec(mockCodec, { postOffset: ({ postOffset }) => postOffset });
            expectNewPostOffset(codec, /* preOffset */ 3, /* newPostOffset */ 7);
            // Before: 0x000000[pre=3]ffffffff[post=7]000000
            // After:  0x000000[pre=3]ffffffff[post=7]000000
        });

        it('doubles the pre-offset', () => {
            const mockCodec = getMockCodec({ innerSize: 4, size: 10 });
            const codec = offsetCodec(mockCodec, { preOffset: ({ preOffset }) => preOffset * 2 });
            expectNewPreOffset(codec, mockCodec, /* preOffset */ 3, /* newPreOffset */ 6);
            // Before: 0x000000[pre=3]ffffffff000000
            // After:  0x000000000000[pre=6]ffffffff
        });

        it('doubles the post-offset', () => {
            const mockCodec = getMockCodec({ innerSize: 1, size: 10 });
            const codec = offsetCodec(mockCodec, { postOffset: ({ postOffset }) => postOffset * 2 });
            expectNewPostOffset(codec, /* preOffset */ 3, /* newPostOffset */ 8);
            // Before: 0x000000[pre=3]ff[post=4]000000000000
            // After:  0x000000[pre=3]ff00000000[post=8]0000
        });

        it('goes forwards and restores the original offset', () => {
            const mockCodec = getMockCodec({ innerSize: 2, size: 10 });
            const codec = offsetCodec(mockCodec, {
                postOffset: ({ preOffset }) => preOffset,
                preOffset: ({ preOffset }) => preOffset + 2,
            });
            expectNewPreOffset(codec, mockCodec, /* preOffset */ 3, /* newPreOffset */ 5);
            expectNewPostOffset(codec, /* preOffset */ 3, /* newPostOffset */ 3);
            // Before: 0x000000[pre=3]ffff[post=5]0000000000
            // After:  0x000000[post=3]0000[pre=5]ffff000000
        });

        it('goes backwards and restores the original offset', () => {
            const mockCodec = getMockCodec({ innerSize: 2, size: 10 });
            const codec = offsetCodec(mockCodec, {
                postOffset: ({ preOffset }) => preOffset,
                preOffset: ({ preOffset }) => preOffset - 3,
            });
            expectNewPreOffset(codec, mockCodec, /* preOffset */ 5, /* newPreOffset */ 2);
            expectNewPostOffset(codec, /* preOffset */ 5, /* newPostOffset */ 5);
            // Before: 0x0000000000[pre=5]ffff[post=7]000000
            // After:  0x0000[pre=2]ffff00[post=5]0000000000
        });
    });

    describe('with absolute offsets', () => {
        it('sets an absolute pre-offset', () => {
            const mockCodec = getMockCodec({ innerSize: 4, size: 10 });
            const codec = offsetCodec(mockCodec, { preOffset: () => 6 });
            expectNewPreOffset(codec, mockCodec, /* preOffset */ 3, /* newPreOffset */ 6);
            // Before: 0x000000[pre=3]ffffffff000000
            // After:  0x000000000000[pre=6]ffffffff
        });

        it('sets an absolute post-offset', () => {
            const mockCodec = getMockCodec({ innerSize: 1, size: 10 });
            const codec = offsetCodec(mockCodec, { postOffset: () => 8 });
            expectNewPostOffset(codec, /* preOffset */ 3, /* newPostOffset */ 8);
            // Before: 0x000000[pre=3]ff[post=4]000000000000
            // After:  0x000000[pre=3]ff00000000[post=8]0000
        });
    });

    describe('with wrapped relative offsets', () => {
        it('uses the provided pre-offset as-is if within the byte range', () => {
            const mockCodec = getMockCodec({ innerSize: 4, size: 10 });
            const codec = offsetCodec(mockCodec, { preOffset: ({ preOffset, wrapBytes }) => wrapBytes(preOffset + 2) });
            expectNewPreOffset(codec, mockCodec, /* preOffset */ 3, /* newPreOffset */ 5);
            // Before: 0x000000[pre=3]ffffffff000000
            // After:  0x0000000000[pre=5]ffffffff00
        });

        it('uses the provided post-offset as-is if within the byte range', () => {
            const mockCodec = getMockCodec({ innerSize: 4, size: 10 });
            const codec = offsetCodec(mockCodec, {
                postOffset: ({ postOffset, wrapBytes }) => wrapBytes(postOffset + 2),
            });
            expectNewPostOffset(codec, /* preOffset */ 3, /* newPostOffset */ 9);
            // Before: 0x000000[pre=3]ffffffff[post=7]000000
            // After:  0x000000[pre=3]ffffffff0000[post=9]00
        });

        it('wraps the pre-offset if it is below the byte range', () => {
            const mockCodec = getMockCodec({ innerSize: 4, size: 10 });
            const codec = offsetCodec(mockCodec, {
                preOffset: ({ preOffset, wrapBytes }) => wrapBytes(preOffset - 12),
            });
            expectNewPreOffset(codec, mockCodec, /* preOffset */ 3, /* newPreOffset */ 1);
            // Before: 0x000000[pre=3]ffffffff000000
            // After:  0x00[pre=1]ffffffff0000000000
        });

        it('wraps the post-offset if it is below the byte range', () => {
            const mockCodec = getMockCodec({ innerSize: 4, size: 10 });
            const codec = offsetCodec(mockCodec, {
                postOffset: ({ postOffset, wrapBytes }) => wrapBytes(postOffset - 12),
            });
            expectNewPostOffset(codec, /* preOffset */ 3, /* newPostOffset */ 5);
            // Before: 0x000000[pre=3]ffffffff[post=7]000000
            // After:  0x000000[pre=3]ffff[post=5]ffff000000
        });

        it('wraps the pre-offset if it is above the byte range', () => {
            const mockCodec = getMockCodec({ innerSize: 4, size: 10 });
            const codec = offsetCodec(mockCodec, {
                preOffset: ({ preOffset, wrapBytes }) => wrapBytes(preOffset + 12),
            });
            expectNewPreOffset(codec, mockCodec, /* preOffset */ 3, /* newPreOffset */ 5);
            // Before: 0x000000[pre=3]ffffffff000000
            // After:  0x0000000000[pre=5]ffffffff00
        });

        it('wraps the post-offset if it is above the byte range', () => {
            const mockCodec = getMockCodec({ innerSize: 4, size: 10 });
            const codec = offsetCodec(mockCodec, {
                postOffset: ({ postOffset, wrapBytes }) => wrapBytes(postOffset + 12),
            });
            expectNewPostOffset(codec, /* preOffset */ 3, /* newPostOffset */ 9);
            // Before: 0x000000[pre=3]ffffffff[post=7]000000
            // After:  0x000000[pre=3]ffffffff0000[post=9]00
        });

        it('always uses a zero offset if the byte array is empty', () => {
            const mockCodec = getMockCodec({ innerSize: 0, size: 0 });
            const codec = offsetCodec(mockCodec, {
                postOffset: ({ postOffset, wrapBytes }) => wrapBytes(postOffset - 42),
                preOffset: ({ preOffset, wrapBytes }) => wrapBytes(preOffset + 42),
            });
            expectNewPreOffset(codec, mockCodec, /* preOffset */ 0, /* newPreOffset */ 0);
            expectNewPostOffset(codec, /* preOffset */ 0, /* newPostOffset */ 0);
            // Before: 0x[pre=0][post=0]
            // After:  0x[pre=0][post=0]
        });
    });

    describe('with wrapped absolute offsets', () => {
        it('uses the provided pre-offset as-is if within the byte range', () => {
            const mockCodec = getMockCodec({ innerSize: 4, size: 10 });
            const codec = offsetCodec(mockCodec, { preOffset: ({ wrapBytes }) => wrapBytes(5) });
            expectNewPreOffset(codec, mockCodec, /* preOffset */ 3, /* newPreOffset */ 5);
            // Before: 0x000000[pre=3]ffffffff000000
            // After:  0x0000000000[pre=5]ffffffff00
        });

        it('uses the provided post-offset as-is if within the byte range', () => {
            const mockCodec = getMockCodec({ innerSize: 4, size: 10 });
            const codec = offsetCodec(mockCodec, { postOffset: ({ wrapBytes }) => wrapBytes(9) });
            expectNewPostOffset(codec, /* preOffset */ 3, /* newPostOffset */ 9);
            // Before: 0x000000[pre=3]ffffffff[post=7]000000
            // After:  0x000000[pre=3]ffffffff0000[post=9]00
        });

        it('wraps the pre-offset if it is below the byte range', () => {
            const mockCodec = getMockCodec({ innerSize: 4, size: 10 });
            const codec = offsetCodec(mockCodec, { preOffset: ({ wrapBytes }) => wrapBytes(-19) });
            expectNewPreOffset(codec, mockCodec, /* preOffset */ 3, /* newPreOffset */ 1);
            // Before: 0x000000[pre=3]ffffffff000000
            // After:  0x00[pre=1]ffffffff0000000000
        });

        it('wraps the post-offset if it is below the byte range', () => {
            const mockCodec = getMockCodec({ innerSize: 4, size: 10 });
            const codec = offsetCodec(mockCodec, { postOffset: ({ wrapBytes }) => wrapBytes(-15) });
            expectNewPostOffset(codec, /* preOffset */ 3, /* newPostOffset */ 5);
            // Before: 0x000000[pre=3]ffffffff[post=7]000000
            // After:  0x000000[pre=3]ffff[post=5]ffff000000
        });

        it('wraps the pre-offset if it is above the byte range', () => {
            const mockCodec = getMockCodec({ innerSize: 4, size: 10 });
            const codec = offsetCodec(mockCodec, { preOffset: ({ wrapBytes }) => wrapBytes(105) });
            expectNewPreOffset(codec, mockCodec, /* preOffset */ 3, /* newPreOffset */ 5);
            // Before: 0x000000[pre=3]ffffffff000000
            // After:  0x0000000000[pre=5]ffffffff00
        });

        it('wraps the post-offset if it is above the byte range', () => {
            const mockCodec = getMockCodec({ innerSize: 4, size: 10 });
            const codec = offsetCodec(mockCodec, { postOffset: ({ wrapBytes }) => wrapBytes(109) });
            expectNewPostOffset(codec, /* preOffset */ 3, /* newPostOffset */ 9);
            // Before: 0x000000[pre=3]ffffffff[post=7]000000
            // After:  0x000000[pre=3]ffffffff0000[post=9]00
        });

        it('always uses a zero offset if the byte array is empty', () => {
            const mockCodec = getMockCodec({ innerSize: 0, size: 0 });
            const codec = offsetCodec(mockCodec, {
                postOffset: ({ wrapBytes }) => wrapBytes(-42),
                preOffset: ({ wrapBytes }) => wrapBytes(42),
            });
            expectNewPreOffset(codec, mockCodec, /* preOffset */ 0, /* newPreOffset */ 0);
            expectNewPostOffset(codec, /* preOffset */ 0, /* newPostOffset */ 0);
            // Before: 0x[pre=0][post=0]
            // After:  0x[pre=0][post=0]
        });
    });

    describe('with offset overflow', () => {
        it('throws an error if the pre-offset is negatif', () => {
            const mockCodec = getMockCodec({ innerSize: 0, size: 10 });
            const codec = offsetCodec(mockCodec, { preOffset: () => -1 });
            expect(() => codec.encode(42)).toThrow(
                new SolanaError(SOLANA_ERROR__CODECS__OFFSET_OUT_OF_RANGE, {
                    bytesLength: 10,
                    codecDescription: 'offsetEncoder',
                    offset: -1,
                }),
            );
            expect(() => codec.decode(b('00'.repeat(10)))).toThrow(
                new SolanaError(SOLANA_ERROR__CODECS__OFFSET_OUT_OF_RANGE, {
                    bytesLength: 10,
                    codecDescription: 'offsetDecoder',
                    offset: -1,
                }),
            );
        });

        it('throws an error if the pre-offset is above the byte array length', () => {
            const mockCodec = getMockCodec({ innerSize: 0, size: 10 });
            const codec = offsetCodec(mockCodec, { preOffset: () => 11 });
            expect(() => codec.encode(42)).toThrow(
                new SolanaError(SOLANA_ERROR__CODECS__OFFSET_OUT_OF_RANGE, {
                    bytesLength: 10,
                    codecDescription: 'offsetEncoder',
                    offset: 11,
                }),
            );
            expect(() => codec.decode(b('00'.repeat(10)))).toThrow(
                new SolanaError(SOLANA_ERROR__CODECS__OFFSET_OUT_OF_RANGE, {
                    bytesLength: 10,
                    codecDescription: 'offsetDecoder',
                    offset: 11,
                }),
            );
        });

        it('does not throw an error if the pre-offset is equal to the byte array length', () => {
            const mockCodec = getMockCodec({ innerSize: 0, size: 10 });
            const codec = offsetCodec(mockCodec, { preOffset: () => 10 });
            expect(() => codec.encode(42)).not.toThrow();
            expect(() => codec.decode(b('00'.repeat(10)))).not.toThrow();
        });

        it('throws an error if the post-offset is negatif', () => {
            const mockCodec = getMockCodec({ innerSize: 0, size: 10 });
            const codec = offsetCodec(mockCodec, { postOffset: () => -1 });
            expect(() => codec.encode(42)).toThrow(
                new SolanaError(SOLANA_ERROR__CODECS__OFFSET_OUT_OF_RANGE, {
                    bytesLength: 10,
                    codecDescription: 'offsetEncoder',
                    offset: -1,
                }),
            );
            expect(() => codec.decode(b('00'.repeat(10)))).toThrow(
                new SolanaError(SOLANA_ERROR__CODECS__OFFSET_OUT_OF_RANGE, {
                    bytesLength: 10,
                    codecDescription: 'offsetDecoder',
                    offset: -1,
                }),
            );
        });

        it('throws an error if the post-offset is above the byte array length', () => {
            const mockCodec = getMockCodec({ innerSize: 0, size: 10 });
            const codec = offsetCodec(mockCodec, { postOffset: () => 11 });
            expect(() => codec.encode(42)).toThrow(
                new SolanaError(SOLANA_ERROR__CODECS__OFFSET_OUT_OF_RANGE, {
                    bytesLength: 10,
                    codecDescription: 'offsetEncoder',
                    offset: 11,
                }),
            );
            expect(() => codec.decode(b('00'.repeat(10)))).toThrow(
                new SolanaError(SOLANA_ERROR__CODECS__OFFSET_OUT_OF_RANGE, {
                    bytesLength: 10,
                    codecDescription: 'offsetDecoder',
                    offset: 11,
                }),
            );
        });

        it('does not throw an error if the post-offset is equal to the byte array length', () => {
            const mockCodec = getMockCodec({ innerSize: 0, size: 10 });
            const codec = offsetCodec(mockCodec, { postOffset: () => 10 });
            expect(() => codec.encode(42)).not.toThrow();
            expect(() => codec.decode(b('00'.repeat(10)))).not.toThrow();
        });
    });
});
