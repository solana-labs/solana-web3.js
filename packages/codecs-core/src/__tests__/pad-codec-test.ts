import { padLeftCodec, padRightCodec } from '../pad-codec';
import { expectNewPostOffset, expectNewPreOffset, getMockCodec } from './__setup__';

describe('padLeftCodec', () => {
    it('offsets and resizes the codec', () => {
        const mockCodec = getMockCodec({ size: 8 });
        const codec = padLeftCodec(mockCodec, 4);
        expect(codec.fixedSize).toBe(12);
        expectNewPreOffset(codec, mockCodec, /* preOffset */ 0, /* newPreOffset */ 4);
        expectNewPostOffset(codec, /* preOffset */ 0, /* newPostOffset */ 12);
        // Before: 0x[pre=0]ffffffffffffffff[post=8]
        // After:  0x00000000[pre=4]ffffffffffffffff[post=12]
    });

    it('does nothing with a zero offset', () => {
        const mockCodec = getMockCodec({ size: 8 });
        const codec = padLeftCodec(mockCodec, 0);
        expect(codec.fixedSize).toBe(8);
        expectNewPreOffset(codec, mockCodec, /* preOffset */ 0, /* newPreOffset */ 0);
        expectNewPostOffset(codec, /* preOffset */ 0, /* newPostOffset */ 8);
        // Before: 0x[pre=0]ffffffffffffffff[post=8]
        // After:  0x[pre=0]ffffffffffffffff[post=8]
    });
});

describe('padRightCodec', () => {
    it('offsets and resizes the codec', () => {
        const mockCodec = getMockCodec({ size: 8 });
        const codec = padRightCodec(mockCodec, 4);
        expect(codec.fixedSize).toBe(12);
        expectNewPreOffset(codec, mockCodec, /* preOffset */ 0, /* newPreOffset */ 0);
        expectNewPostOffset(codec, /* preOffset */ 0, /* newPostOffset */ 12);
        // Before: 0x[pre=0]ffffffffffffffff[post=8]
        // After:  0x[pre=0]ffffffffffffffff00000000[post=12]
    });

    it('does nothing with a zero offset', () => {
        const mockCodec = getMockCodec({ size: 8 });
        const codec = padRightCodec(mockCodec, 0);
        expect(codec.fixedSize).toBe(8);
        expectNewPreOffset(codec, mockCodec, /* preOffset */ 0, /* newPreOffset */ 0);
        expectNewPostOffset(codec, /* preOffset */ 0, /* newPostOffset */ 8);
        // Before: 0x[pre=0]ffffffffffffffff[post=8]
        // After:  0x[pre=0]ffffffffffffffff[post=8]
    });
});
