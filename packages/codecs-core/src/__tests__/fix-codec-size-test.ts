import { SOLANA_ERROR__CODECS__INVALID_BYTE_LENGTH, SolanaError } from '@solana/errors';

import { createCodec } from '../codec';
import { fixCodecSize, fixDecoderSize, fixEncoderSize } from '../fix-codec-size';
import { b, getMockCodec } from './__setup__';

describe('fixCodecSize', () => {
    it('keeps same-sized byte arrays as-is', () => {
        const mockCodec = getMockCodec();

        mockCodec.getSizeFromValue.mockReturnValueOnce(10);
        mockCodec.write.mockImplementation((_, bytes: Uint8Array, offset: number) => {
            bytes.set(b('08050c0c0f170f120c04'), offset);
            return offset + 10;
        });
        expect(fixCodecSize(mockCodec, 10).encode('helloworld')).toStrictEqual(b('08050c0c0f170f120c04'));
        expect(mockCodec.write).toHaveBeenCalledWith('helloworld', expect.any(Uint8Array), 0);

        fixCodecSize(mockCodec, 10).decode(b('08050c0c0f170f120c04'));
        expect(mockCodec.read).toHaveBeenCalledWith(b('08050c0c0f170f120c04'), 0);

        fixCodecSize(mockCodec, 10).read(b('ffff08050c0c0f170f120c04'), 2);
        expect(mockCodec.read).toHaveBeenCalledWith(b('08050c0c0f170f120c04'), 0);
    });

    it('truncates over-sized byte arrays', () => {
        const mockCodec = getMockCodec();

        mockCodec.getSizeFromValue.mockReturnValueOnce(10);
        mockCodec.write.mockImplementation((_, bytes: Uint8Array, offset: number) => {
            bytes.set(b('08050c0c0f170f120c04'), offset);
            return offset + 10;
        });
        expect(fixCodecSize(mockCodec, 5).encode('helloworld')).toStrictEqual(b('08050c0c0f'));
        expect(mockCodec.write).toHaveBeenCalledWith('helloworld', expect.any(Uint8Array), 0);

        fixCodecSize(mockCodec, 5).decode(b('08050c0c0f170f120c04'));
        expect(mockCodec.read).toHaveBeenCalledWith(b('08050c0c0f'), 0);

        fixCodecSize(mockCodec, 5).read(b('ffff08050c0c0f170f120c04'), 2);
        expect(mockCodec.read).toHaveBeenCalledWith(b('08050c0c0f'), 0);
    });

    it('pads under-sized byte arrays', () => {
        const mockCodec = getMockCodec();

        mockCodec.getSizeFromValue.mockReturnValueOnce(5);
        mockCodec.write.mockImplementation((_, bytes: Uint8Array, offset: number) => {
            bytes.set(b('08050c0c0f'), offset);
            return offset + 5;
        });
        expect(fixCodecSize(mockCodec, 10).encode('hello')).toStrictEqual(b('08050c0c0f0000000000'));
        expect(mockCodec.write).toHaveBeenCalledWith('hello', expect.any(Uint8Array), 0);

        fixCodecSize(mockCodec, 10).decode(b('08050c0c0f0000000000'));
        expect(mockCodec.read).toHaveBeenCalledWith(b('08050c0c0f0000000000'), 0);

        fixCodecSize(mockCodec, 10).read(b('ffff08050c0c0f0000000000'), 2);
        expect(mockCodec.read).toHaveBeenCalledWith(b('08050c0c0f0000000000'), 0);

        expect(() => fixCodecSize(mockCodec, 10).decode(b('08050c0c0f'))).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__INVALID_BYTE_LENGTH, {
                bytesLength: 5,
                codecDescription: 'fixCodecSize',
                expected: 10,
            }),
        );
    });

    it('has the right sizes', () => {
        const mockCodec = getMockCodec({ size: null });
        expect(fixCodecSize(mockCodec, 12).fixedSize).toBe(12);
        expect(fixCodecSize(mockCodec, 42).fixedSize).toBe(42);
    });

    it('can fix a codec that requires a minimum amount of bytes', () => {
        // Given a mock `u32` codec that ensures the byte array is 4 bytes long.
        const u32 = createCodec<number>({
            fixedSize: 4,
            read(bytes, offset = 0): [number, number] {
                // eslint-disable-next-line jest/no-conditional-in-test
                if (bytes.slice(offset).length < offset + 4) {
                    throw new Error('Not enough bytes to decode a u32.');
                }
                return [bytes.slice(offset)[0], offset + 4];
            },
            write: (value: number, bytes, offset) => {
                bytes.set([value], offset);
                return offset + 4;
            },
        });

        // When we synthesize a `u24` from that `u32` using `fixCodecSize`.
        const u24 = fixCodecSize(u32, 3);

        // Then we can encode a `u24`.
        const bytes = u24.encode(42);
        expect(bytes).toStrictEqual(new Uint8Array([42, 0, 0]));

        // And we can decode it back.
        const hydrated = u24.read(bytes, 0);
        expect(hydrated).toStrictEqual([42, 3]);
    });
});

describe('fixEncoderSize', () => {
    it('can fix an encoder to a given amount of bytes', () => {
        const mockCodec = getMockCodec();

        mockCodec.getSizeFromValue.mockReturnValueOnce(10);
        mockCodec.write.mockImplementationOnce((_, bytes: Uint8Array, offset: number) => {
            bytes.set(b('08050c0c0f170f120c04'), offset);
            return offset + 10;
        });
        expect(fixEncoderSize(mockCodec, 10).encode('helloworld')).toStrictEqual(b('08050c0c0f170f120c04'));
        expect(mockCodec.write).toHaveBeenCalledWith('helloworld', expect.any(Uint8Array), 0);

        mockCodec.getSizeFromValue.mockReturnValueOnce(10);
        mockCodec.write.mockImplementationOnce((_, bytes: Uint8Array, offset: number) => {
            bytes.set(b('08050c0c0f170f120c04'), offset);
            return offset + 10;
        });
        expect(fixEncoderSize(mockCodec, 5).encode('helloworld')).toStrictEqual(b('08050c0c0f'));
        expect(mockCodec.write).toHaveBeenCalledWith('helloworld', expect.any(Uint8Array), 0);

        mockCodec.getSizeFromValue.mockReturnValueOnce(5);
        mockCodec.write.mockImplementationOnce((_, bytes: Uint8Array, offset: number) => {
            bytes.set(b('08050c0c0f'), offset);
            return offset + 5;
        });
        expect(fixEncoderSize(mockCodec, 10).encode('hello')).toStrictEqual(b('08050c0c0f0000000000'));
        expect(mockCodec.write).toHaveBeenCalledWith('hello', expect.any(Uint8Array), 0);
    });
});

describe('fixDecoderSize', () => {
    it('can fix a decoder to a given amount of bytes', () => {
        const mockCodec = getMockCodec();

        fixDecoderSize(mockCodec, 10).decode(b('08050c0c0f170f120c04'));
        expect(mockCodec.read).toHaveBeenCalledWith(b('08050c0c0f170f120c04'), 0);

        fixDecoderSize(mockCodec, 5).decode(b('08050c0c0f170f120c04'));
        expect(mockCodec.read).toHaveBeenCalledWith(b('08050c0c0f'), 0);

        fixDecoderSize(mockCodec, 10).decode(b('08050c0c0f0000000000'));
        expect(mockCodec.read).toHaveBeenCalledWith(b('08050c0c0f0000000000'), 0);

        expect(() => fixDecoderSize(mockCodec, 10).decode(b('08050c0c0f'))).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__INVALID_BYTE_LENGTH, {
                bytesLength: 5,
                codecDescription: 'fixCodecSize',
                expected: 10,
            }),
        );
    });
});
