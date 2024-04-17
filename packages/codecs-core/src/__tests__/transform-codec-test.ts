import { Codec, createCodec, createDecoder, createEncoder } from '../codec';
import { ReadonlyUint8Array } from '../readonly-uint8array';
import { transformCodec, transformDecoder, transformEncoder } from '../transform-codec';

const numberCodec: Codec<number> = createCodec({
    fixedSize: 1,
    read: (bytes: ReadonlyUint8Array | Uint8Array): [number, number] => [bytes[0], 1],
    write: (value: number, bytes, offset) => {
        bytes.set([value], offset);
        return offset + 1;
    },
});

describe('transformCodec', () => {
    it('can loosen the codec input with a map', () => {
        // From <number> to <number | string, number>.
        const mappedCodec: Codec<number | string, number> = transformCodec(numberCodec, (value: number | string) =>
            // eslint-disable-next-line jest/no-conditional-in-test
            typeof value === 'number' ? value : value.length,
        );

        const bytesA = mappedCodec.encode(42);
        expect(mappedCodec.decode(bytesA)).toBe(42);

        const bytesB = mappedCodec.encode('Hello world');
        expect(mappedCodec.decode(bytesB)).toBe(11);
    });

    it('can map both the input and output of a codec', () => {
        // From <number> to <number | string, string>.
        const mappedCodec: Codec<number | string, string> = transformCodec(
            numberCodec,
            // eslint-disable-next-line jest/no-conditional-in-test
            (value: number | string) => (typeof value === 'number' ? value : value.length),
            (value: number) => 'x'.repeat(value),
        );

        const bytesA = mappedCodec.encode(42);
        expect(mappedCodec.decode(bytesA)).toBe('x'.repeat(42));

        const bytesB = mappedCodec.encode('Hello world');
        expect(mappedCodec.decode(bytesB)).toBe('x'.repeat(11));
    });

    it('can map the input and output of a codec to the same type', () => {
        // From <number> to <string>.
        const mappedCodec: Codec<string> = transformCodec(
            numberCodec,
            (value: string) => value.length,
            (value: number) => 'x'.repeat(value),
        );

        const bytesA = mappedCodec.encode('42');
        expect(mappedCodec.decode(bytesA)).toBe('xx');

        const bytesB = mappedCodec.encode('Hello world');
        expect(mappedCodec.decode(bytesB)).toBe('xxxxxxxxxxx');
    });

    it('can wrap a codec type in an object using a map', () => {
        // From <number> to <{ value: number }>.
        type Wrap<T> = { value: T };
        const mappedCodec: Codec<Wrap<number>> = transformCodec(
            numberCodec,
            (value: Wrap<number>) => value.value,
            (value: number): Wrap<number> => ({ value }),
        );

        const bytes = mappedCodec.encode({ value: 42 });
        expect(mappedCodec.decode(bytes)).toStrictEqual({ value: 42 });
    });

    it('map a codec to loosen its input by providing default values', () => {
        // Create Codec<Strict>.
        type Strict = { discriminator: number; label: string };
        const strictCodec: Codec<Strict> = createCodec({
            fixedSize: 2,
            read: (bytes: ReadonlyUint8Array | Uint8Array): [Strict, number] => [
                { discriminator: bytes[0], label: 'x'.repeat(bytes[1]) },
                1,
            ],
            write: (value: Strict, bytes, offset) => {
                bytes.set([value.discriminator, value.label.length], offset);
                return offset + 2;
            },
        });

        const bytesA = strictCodec.encode({ discriminator: 5, label: 'Hello world' });
        expect(strictCodec.decode(bytesA)).toStrictEqual({
            discriminator: 5,
            label: 'xxxxxxxxxxx',
        });

        // From <Strict> to <Loose, Strict>.
        type Loose = { discriminator?: number; label: string };
        const looseCodec: Codec<Loose, Strict> = transformCodec(
            strictCodec,
            (value: Loose): Strict => ({
                discriminator: 42, // <- Default value.
                ...value,
            }),
        );

        // With explicit discriminator.
        const bytesB = looseCodec.encode({ discriminator: 5, label: 'Hello world' });
        expect(looseCodec.decode(bytesB)).toStrictEqual({
            discriminator: 5,
            label: 'xxxxxxxxxxx',
        });

        // With implicit discriminator.
        const bytesC = looseCodec.encode({ label: 'Hello world' });
        expect(looseCodec.decode(bytesC)).toStrictEqual({
            discriminator: 42,
            label: 'xxxxxxxxxxx',
        });
    });

    it('can loosen a tuple codec', () => {
        const codec: Codec<[number, string]> = createCodec({
            fixedSize: 2,
            read: (bytes: ReadonlyUint8Array | Uint8Array): [[number, string], number] => [
                [bytes[0], 'x'.repeat(bytes[1])],
                2,
            ],
            write: (value: [number, string], bytes, offset) => {
                bytes.set([value[0], value[1].length], offset);
                return offset + 2;
            },
        });

        const bytesA = codec.encode([42, 'Hello world']);
        expect(codec.decode(bytesA)).toStrictEqual([42, 'xxxxxxxxxxx']);

        const mappedCodec = transformCodec(codec, (value: [number | null, string]): [number, string] => [
            // eslint-disable-next-line jest/no-conditional-in-test
            value[0] ?? value[1].length,
            value[1],
        ]);

        const bytesB = mappedCodec.encode([null, 'Hello world']);
        expect(mappedCodec.decode(bytesB)).toStrictEqual([11, 'xxxxxxxxxxx']);

        const bytesC = mappedCodec.encode([42, 'Hello world']);
        expect(mappedCodec.decode(bytesC)).toStrictEqual([42, 'xxxxxxxxxxx']);
    });
});

describe('transformEncoder', () => {
    it('can map an encoder to another encoder', () => {
        const encoderA = createEncoder({
            fixedSize: 1,
            write: (value: number, bytes, offset) => {
                bytes.set([value], offset);
                return offset + 1;
            },
        });

        const encoderB = transformEncoder(encoderA, (value: string): number => value.length);

        expect(encoderB.fixedSize).toBe(1);
        expect(encoderB.encode('helloworld')).toStrictEqual(new Uint8Array([10]));
    });
});

describe('transformDecoder', () => {
    it('can map an encoder to another encoder', () => {
        const decoder = createDecoder({
            fixedSize: 1,
            read: (bytes: ReadonlyUint8Array | Uint8Array, offset = 0) => [bytes[offset], offset + 1],
        });

        const decoderB = transformDecoder(decoder, (value: number): string => 'x'.repeat(value));

        expect(decoderB.fixedSize).toBe(1);
        expect(decoderB.decode(new Uint8Array([10]))).toBe('xxxxxxxxxx');
    });
});
