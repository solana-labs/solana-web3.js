import {
    assertBufferHasEnoughBytesForCodec,
    assertBufferIsNotEmptyForCodec,
    CodecData,
    Decoder,
    Encoder,
} from '@solana/codecs-core';

import { assertNumberIsBetweenForCodec } from './assertions';
import { Endian, NumberCodecOptions, SingleByteNumberCodecOptions } from './common';

type NumberFactorySharedInput = {
    name: string;
    size: number;
    options: SingleByteNumberCodecOptions | NumberCodecOptions;
};

type NumberFactoryEncoderInput<T> = NumberFactorySharedInput & {
    range?: [number | bigint, number | bigint];
    set: (view: DataView, value: T, littleEndian?: boolean) => void;
};

type NumberFactoryDecoderInput<T> = NumberFactorySharedInput & {
    get: (view: DataView, littleEndian?: boolean) => T;
};

function sharedNumberFactory(input: NumberFactorySharedInput): CodecData & { littleEndian: boolean | undefined } {
    let littleEndian: boolean | undefined;
    let defaultDescription: string = input.name;

    if (input.size > 1) {
        littleEndian = !('endian' in input.options) || input.options.endian === Endian.Little;
        defaultDescription += littleEndian ? '(le)' : '(be)';
    }

    return {
        description: input.options.description ?? defaultDescription,
        fixedSize: input.size,
        littleEndian,
        maxSize: input.size,
    };
}

export function numberEncoderFactory<T extends number | bigint>(input: NumberFactoryEncoderInput<T>): Encoder<T> {
    const codecData = sharedNumberFactory(input);

    return {
        description: codecData.description,
        encode(value: T): Uint8Array {
            if (input.range) {
                assertNumberIsBetweenForCodec(input.name, input.range[0], input.range[1], value);
            }
            const buffer = new ArrayBuffer(input.size);
            input.set(new DataView(buffer), value, codecData.littleEndian);
            return new Uint8Array(buffer);
        },
        fixedSize: codecData.fixedSize,
        maxSize: codecData.maxSize,
    };
}

export function numberDecoderFactory<T extends number | bigint>(input: NumberFactoryDecoderInput<T>): Decoder<T> {
    const codecData = sharedNumberFactory(input);

    return {
        decode(bytes, offset = 0): [T, number] {
            const slice = bytes.slice(offset, offset + input.size);
            assertBufferIsNotEmptyForCodec(codecData.description, slice);
            assertBufferHasEnoughBytesForCodec(codecData.description, slice, input.size);
            const view = new DataView(toArrayBuffer(slice));
            return [input.get(view, codecData.littleEndian), offset + input.size];
        },
        description: codecData.description,
        fixedSize: codecData.fixedSize,
        maxSize: codecData.maxSize,
    };
}

/**
 * Helper function to ensure that the array buffer is converted properly from a Uint8Array
 * Source: https://stackoverflow.com/questions/37228285/uint8array-to-arraybuffer
 */
function toArrayBuffer(array: Uint8Array): ArrayBuffer {
    return array.buffer.slice(array.byteOffset, array.byteLength + array.byteOffset);
}
