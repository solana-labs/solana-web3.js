import { Codec, Decoder, Encoder } from '../codec';
import { combineCodec } from '../combine-codec';

describe('combineCodec', () => {
    const mockEncode: Encoder<number>['encode'] = () => new Uint8Array([]);
    const mockDecode: Decoder<number>['decode'] = (_bytes: Uint8Array, offset = 0) => [42, offset];

    it('can join encoders and decoders with the same type', () => {
        const u8Encoder: Encoder<number> = {
            description: 'u8',
            encode: (value: number) => new Uint8Array([value]),
            fixedSize: 1,
            maxSize: 1,
        };

        const u8Decoder: Decoder<number> = {
            decode: (bytes: Uint8Array, offset = 0) => [bytes[offset], offset + 1],
            description: 'u8',
            fixedSize: 1,
            maxSize: 1,
        };

        const u8Codec: Codec<number> = combineCodec(u8Encoder, u8Decoder);

        expect(u8Codec.description).toBe('u8');
        expect(u8Codec.fixedSize).toBe(1);
        expect(u8Codec.maxSize).toBe(1);
        expect(u8Codec.encode(42)).toStrictEqual(new Uint8Array([42]));
        expect(u8Codec.decode(new Uint8Array([42]))).toStrictEqual([42, 1]);
    });

    it('can join encoders and decoders with different but matching types', () => {
        const u8Encoder: Encoder<number | bigint> = {
            description: 'u8',
            encode: (value: number | bigint) => new Uint8Array([Number(value)]),
            fixedSize: 1,
            maxSize: 1,
        };

        const u8Decoder: Decoder<bigint> = {
            decode: (bytes: Uint8Array, offset = 0) => [BigInt(bytes[offset]), offset + 1],
            description: 'u8',
            fixedSize: 1,
            maxSize: 1,
        };

        const u8Codec: Codec<number | bigint, bigint> = combineCodec(u8Encoder, u8Decoder);

        expect(u8Codec.description).toBe('u8');
        expect(u8Codec.fixedSize).toBe(1);
        expect(u8Codec.maxSize).toBe(1);
        expect(u8Codec.encode(42)).toStrictEqual(new Uint8Array([42]));
        expect(u8Codec.encode(42n)).toStrictEqual(new Uint8Array([42]));
        expect(u8Codec.decode(new Uint8Array([42]))).toStrictEqual([42n, 1]);
    });

    it('cannot join encoders and decoders with sizes or descriptions', () => {
        expect(() =>
            combineCodec(
                { description: 'u8', encode: mockEncode, fixedSize: 1, maxSize: 1 },
                { decode: mockDecode, description: 'u8', fixedSize: 2, maxSize: 1 }
            )
        ).toThrow('Encoder and decoder must have the same fixed size, got [1] and [2]');

        expect(() =>
            combineCodec(
                { description: 'u8', encode: mockEncode, fixedSize: 1, maxSize: 1 },
                { decode: mockDecode, description: 'u8', fixedSize: 1, maxSize: null }
            )
        ).toThrow('Encoder and decoder must have the same max size, got [1] and [null]');

        expect(() =>
            combineCodec(
                { description: 'u8', encode: mockEncode, fixedSize: 1, maxSize: 1 },
                { decode: mockDecode, description: 'u16', fixedSize: 1, maxSize: 1 }
            )
        ).toThrow('Encoder and decoder must have the same description, got [u8] and [u16]');
    });

    it('can override the description of the joined codec', () => {
        const myCodec = combineCodec(
            { description: 'u8', encode: mockEncode, fixedSize: 1, maxSize: 1 },
            { decode: mockDecode, description: 'u16', fixedSize: 1, maxSize: 1 },
            'myCustomDescription'
        );

        expect(myCodec.description).toBe('myCustomDescription');
    });
});
