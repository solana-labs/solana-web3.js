import { Codec, createDecoder, createEncoder, Decoder, Encoder } from '../codec';
import { combineCodec } from '../combine-codec';

describe('combineCodec', () => {
    const mockGetSize: Encoder<number>['getSize'] = () => 42;
    const mockWrite: Encoder<number>['write'] = () => 42;
    const mockRead: Decoder<number>['read'] = (_bytes: Uint8Array, offset = 0) => [42, offset];

    it('can join encoders and decoders with the same type', () => {
        const u8Encoder: Encoder<number> = createEncoder({
            description: 'u8',
            fixedSize: 1,
            write: (value: number, buffer, offset) => {
                buffer.set([value], offset);
                return offset + 1;
            },
        });

        const u8Decoder: Decoder<number> = createDecoder({
            description: 'u8',
            fixedSize: 1,
            read: (bytes: Uint8Array, offset = 0) => [bytes[offset], offset + 1],
        });

        const u8Codec: Codec<number> = combineCodec(u8Encoder, u8Decoder);

        expect(u8Codec.description).toBe('u8');
        expect(u8Codec.fixedSize).toBe(1);
        expect(u8Codec.maxSize).toBe(1);
        expect(u8Codec.encode(42)).toStrictEqual(new Uint8Array([42]));
        expect(u8Codec.decode(new Uint8Array([42]))).toBe(42);
    });

    it('can join encoders and decoders with different but matching types', () => {
        const u8Encoder: Encoder<number | bigint> = createEncoder({
            description: 'u8',
            fixedSize: 1,
            write: (value: number | bigint, buffer, offset) => {
                buffer.set([Number(value)], offset);
                return offset + 1;
            },
        });

        const u8Decoder: Decoder<bigint> = createDecoder({
            description: 'u8',
            fixedSize: 1,
            read: (bytes: Uint8Array, offset = 0) => [BigInt(bytes[offset]), offset + 1],
        });

        const u8Codec: Codec<number | bigint, bigint> = combineCodec(u8Encoder, u8Decoder);

        expect(u8Codec.description).toBe('u8');
        expect(u8Codec.fixedSize).toBe(1);
        expect(u8Codec.maxSize).toBe(1);
        expect(u8Codec.encode(42)).toStrictEqual(new Uint8Array([42]));
        expect(u8Codec.encode(42n)).toStrictEqual(new Uint8Array([42]));
        expect(u8Codec.decode(new Uint8Array([42]))).toBe(42n);
    });

    it('cannot join encoders and decoders with sizes or descriptions', () => {
        expect(() =>
            combineCodec(
                createEncoder({ fixedSize: 1, write: mockWrite }),
                createDecoder({ fixedSize: 2, read: mockRead })
            )
        ).toThrow('Encoder and decoder must have the same fixed size, got [1] and [2]');

        expect(() =>
            combineCodec(
                createEncoder({ getSize: mockGetSize, maxSize: 1, write: mockWrite }),
                createDecoder({ fixedSize: null, maxSize: null, read: mockRead })
            )
        ).toThrow('Encoder and decoder must have the same max size, got [1] and [null]');

        expect(() =>
            combineCodec(
                createEncoder({ description: 'u8', fixedSize: 1, write: mockWrite }),
                createDecoder({ description: 'u16', fixedSize: 1, read: mockRead })
            )
        ).toThrow('Encoder and decoder must have the same description, got [u8] and [u16]');
    });

    it('can override the description of the joined codec', () => {
        const myCodec = combineCodec(
            createEncoder({ description: 'u8', fixedSize: 1, write: mockWrite }),
            createDecoder({ description: 'u16', fixedSize: 1, read: mockRead }),
            'myCustomDescription'
        );

        expect(myCodec.description).toBe('myCustomDescription');
    });
});
