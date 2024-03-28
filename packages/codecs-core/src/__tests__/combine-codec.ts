import {
    SOLANA_ERROR__CODECS__ENCODER_DECODER_FIXED_SIZE_MISMATCH,
    SOLANA_ERROR__CODECS__ENCODER_DECODER_MAX_SIZE_MISMATCH,
    SolanaError,
} from '@solana/errors';

import { createDecoder, createEncoder, FixedSizeCodec, FixedSizeDecoder, FixedSizeEncoder } from '../codec';
import { combineCodec } from '../combine-codec';
import { ReadonlyUint8Array } from '../readonly-uint8array';

describe('combineCodec', () => {
    it('can join encoders and decoders with the same type', () => {
        const u8Encoder = createEncoder({
            fixedSize: 1,
            write: (value: number, buffer, offset) => {
                buffer.set([value], offset);
                return offset + 1;
            },
        });

        const u8Decoder = createDecoder({
            fixedSize: 1,
            read: (bytes: ReadonlyUint8Array | Uint8Array, offset = 0) => [bytes[offset], offset + 1],
        });

        const u8Codec = combineCodec(u8Encoder, u8Decoder);

        expect(u8Codec.fixedSize).toBe(1);
        expect(u8Codec.encode(42)).toStrictEqual(new Uint8Array([42]));
        expect(u8Codec.decode(new Uint8Array([42]))).toBe(42);
    });

    it('can join encoders and decoders with different but matching types', () => {
        const u8Encoder: FixedSizeEncoder<bigint | number> = createEncoder({
            fixedSize: 1,
            write: (value: bigint | number, buffer, offset) => {
                buffer.set([Number(value)], offset);
                return offset + 1;
            },
        });

        const u8Decoder: FixedSizeDecoder<bigint> = createDecoder({
            fixedSize: 1,
            read: (bytes: ReadonlyUint8Array | Uint8Array, offset = 0) => [BigInt(bytes[offset]), offset + 1],
        });

        const u8Codec: FixedSizeCodec<bigint | number, bigint> = combineCodec(u8Encoder, u8Decoder);

        expect(u8Codec.fixedSize).toBe(1);
        expect(u8Codec.encode(42)).toStrictEqual(new Uint8Array([42]));
        expect(u8Codec.encode(42n)).toStrictEqual(new Uint8Array([42]));
        expect(u8Codec.decode(new Uint8Array([42]))).toBe(42n);
    });

    it('cannot join encoders and decoders with different sizes', () => {
        expect(() =>
            combineCodec(
                createEncoder({ fixedSize: 1, write: jest.fn() }),
                createDecoder({ fixedSize: 2, read: jest.fn() }),
            ),
        ).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__ENCODER_DECODER_FIXED_SIZE_MISMATCH, {
                decoderFixedSize: 2,
                encoderFixedSize: 1,
            }),
        );

        expect(() =>
            combineCodec(
                createEncoder({ getSizeFromValue: jest.fn(), maxSize: 1, write: jest.fn() }),
                createDecoder({ read: jest.fn() }),
            ),
        ).toThrow(
            new SolanaError(SOLANA_ERROR__CODECS__ENCODER_DECODER_MAX_SIZE_MISMATCH, {
                decoderMaxSize: undefined,
                encoderMaxSize: 1,
            }),
        );
    });
});
