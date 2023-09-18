/* eslint-disable sort-keys-fix/sort-keys-fix */
import { Codec, Decoder, Encoder } from '../codec';
import { mapCodec, mapDecoder, mapEncoder } from '../mapCodec';

const numberCodec: Codec<number> = {
    description: 'number',
    fixedSize: 1,
    maxSize: 1,
    encode: (value: number) => new Uint8Array([value]),
    decode: (buffer: Uint8Array): [number, number] => [buffer[0], 1],
};

describe('mapCodec', () => {
    it('can loosen the codec input with a map', () => {
        // From <number> to <number | string, number>.
        const mappedCodec: Codec<number | string, number> = mapCodec(numberCodec, (value: number | string) =>
            // eslint-disable-next-line jest/no-conditional-in-test
            typeof value === 'number' ? value : value.length
        );

        const bufferA = mappedCodec.encode(42);
        expect(mappedCodec.decode(bufferA)[0]).toBe(42);

        const bufferB = mappedCodec.encode('Hello world');
        expect(mappedCodec.decode(bufferB)[0]).toBe(11);
    });

    it('can map both the input and output of a codec', () => {
        // From <number> to <number | string, string>.
        const mappedCodec: Codec<number | string, string> = mapCodec(
            numberCodec,
            // eslint-disable-next-line jest/no-conditional-in-test
            (value: number | string) => (typeof value === 'number' ? value : value.length),
            (value: number) => 'x'.repeat(value)
        );

        const bufferA = mappedCodec.encode(42);
        expect(mappedCodec.decode(bufferA)[0]).toBe('x'.repeat(42));

        const bufferB = mappedCodec.encode('Hello world');
        expect(mappedCodec.decode(bufferB)[0]).toBe('x'.repeat(11));
    });

    it('can map the input and output of a codec to the same type', () => {
        // From <number> to <string>.
        const mappedCodec: Codec<string> = mapCodec(
            numberCodec,
            (value: string) => value.length,
            (value: number) => 'x'.repeat(value)
        );

        const bufferA = mappedCodec.encode('42');
        expect(mappedCodec.decode(bufferA)[0]).toBe('xx');

        const bufferB = mappedCodec.encode('Hello world');
        expect(mappedCodec.decode(bufferB)[0]).toBe('xxxxxxxxxxx');
    });

    it('can wrap a codec type in an object using a map', () => {
        // From <number> to <{ value: number }>.
        type Wrap<T> = { value: T };
        const mappedCodec: Codec<Wrap<number>> = mapCodec(
            numberCodec,
            (value: Wrap<number>) => value.value,
            (value: number): Wrap<number> => ({ value })
        );

        const buffer = mappedCodec.encode({ value: 42 });
        expect(mappedCodec.decode(buffer)[0]).toStrictEqual({ value: 42 });
    });

    it('map a codec to loosen its input by providing default values', () => {
        // Create Codec<Strict>.
        type Strict = { discriminator: number; label: string };
        const strictCodec: Codec<Strict> = {
            description: 'Strict',
            fixedSize: 2,
            maxSize: 2,
            encode: (value: Strict) => new Uint8Array([value.discriminator, value.label.length]),
            decode: (buffer: Uint8Array): [Strict, number] => [
                { discriminator: buffer[0], label: 'x'.repeat(buffer[1]) },
                1,
            ],
        };

        const bufferA = strictCodec.encode({ discriminator: 5, label: 'Hello world' });
        expect(strictCodec.decode(bufferA)[0]).toStrictEqual({
            discriminator: 5,
            label: 'xxxxxxxxxxx',
        });

        // From <Strict> to <Loose, Strict>.
        type Loose = { discriminator?: number; label: string };
        const looseCodec: Codec<Loose, Strict> = mapCodec(
            strictCodec,
            (value: Loose): Strict => ({
                discriminator: 42, // <- Default value.
                ...value,
            })
        );

        // With explicit discriminator.
        const bufferB = looseCodec.encode({ discriminator: 5, label: 'Hello world' });
        expect(looseCodec.decode(bufferB)[0]).toStrictEqual({
            discriminator: 5,
            label: 'xxxxxxxxxxx',
        });

        // With implicit discriminator.
        const bufferC = looseCodec.encode({ label: 'Hello world' });
        expect(looseCodec.decode(bufferC)[0]).toStrictEqual({
            discriminator: 42,
            label: 'xxxxxxxxxxx',
        });
    });

    it('can loosen a tuple codec', () => {
        const codec: Codec<[number, string]> = {
            description: 'Tuple',
            fixedSize: 2,
            maxSize: 2,
            encode: (value: [number, string]) => new Uint8Array([value[0], value[1].length]),
            decode: (buffer: Uint8Array): [[number, string], number] => [[buffer[0], 'x'.repeat(buffer[1])], 2],
        };

        const bufferA = codec.encode([42, 'Hello world']);
        expect(codec.decode(bufferA)[0]).toStrictEqual([42, 'xxxxxxxxxxx']);

        const mappedCodec = mapCodec(codec, (value: [number | null, string]): [number, string] => [
            // eslint-disable-next-line jest/no-conditional-in-test
            value[0] ?? value[1].length,
            value[1],
        ]);

        const bufferB = mappedCodec.encode([null, 'Hello world']);
        expect(mappedCodec.decode(bufferB)[0]).toStrictEqual([11, 'xxxxxxxxxxx']);

        const bufferC = mappedCodec.encode([42, 'Hello world']);
        expect(mappedCodec.decode(bufferC)[0]).toStrictEqual([42, 'xxxxxxxxxxx']);
    });
});

describe('mapEncoder', () => {
    it('can map an encoder to another encoder', () => {
        const encoderA: Encoder<number> = {
            description: 'A',
            fixedSize: 1,
            maxSize: 1,
            encode: (value: number) => new Uint8Array([value]),
        };

        const encoderB = mapEncoder(encoderA, (value: string): number => value.length);

        expect(encoderB.description).toBe('A');
        expect(encoderB.fixedSize).toBe(1);
        expect(encoderB.maxSize).toBe(1);
        expect(encoderB.encode('helloworld')).toStrictEqual(new Uint8Array([10]));
    });
});

describe('mapDecoder', () => {
    it('can map an encoder to another encoder', () => {
        const decoder: Decoder<number> = {
            description: 'A',
            fixedSize: 1,
            maxSize: 1,
            decode: (bytes: Uint8Array, offset = 0) => [bytes[offset], offset + 1],
        };

        const decoderB = mapDecoder(decoder, (value: number): string => 'x'.repeat(value));

        expect(decoderB.description).toBe('A');
        expect(decoderB.fixedSize).toBe(1);
        expect(decoderB.maxSize).toBe(1);
        expect(decoderB.decode(new Uint8Array([10]))).toStrictEqual(['xxxxxxxxxx', 1]);
    });
});
