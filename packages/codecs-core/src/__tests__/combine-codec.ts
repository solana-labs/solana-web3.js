import { createDecoder, createEncoder, FixedSizeCodec, FixedSizeDecoder, FixedSizeEncoder } from '../codec';
import { combineCodec } from '../combine-codec';

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
            read: (bytes: Uint8Array, offset = 0) => [bytes[offset], offset + 1],
        });

        const u8Codec = combineCodec(u8Encoder, u8Decoder);

        expect(u8Codec.fixedSize).toBe(1);
        expect(u8Codec.encode(42)).toStrictEqual(new Uint8Array([42]));
        expect(u8Codec.decode(new Uint8Array([42]))).toBe(42);
    });

    it('can join encoders and decoders with different but matching types', () => {
        const u8Encoder: FixedSizeEncoder<number | bigint> = createEncoder({
            fixedSize: 1,
            write: (value: number | bigint, buffer, offset) => {
                buffer.set([Number(value)], offset);
                return offset + 1;
            },
        });

        const u8Decoder: FixedSizeDecoder<bigint> = createDecoder({
            fixedSize: 1,
            read: (bytes: Uint8Array, offset = 0) => [BigInt(bytes[offset]), offset + 1],
        });

        const u8Codec: FixedSizeCodec<number | bigint, bigint> = combineCodec(u8Encoder, u8Decoder);

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
        ).toThrow('Encoder and decoder must have the same fixed size, got [1] and [2]');

        expect(() =>
            combineCodec(
                createEncoder({ getSizeFromValue: jest.fn(), maxSize: 1, write: jest.fn() }),
                createDecoder({ read: jest.fn() }),
            ),
        ).toThrow('Encoder and decoder must have the same max size, got [1] and [undefined]');
    });
});
