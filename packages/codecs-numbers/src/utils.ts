import {
    assertByteArrayHasEnoughBytesForCodec,
    assertByteArrayIsNotEmptyForCodec,
    createDecoder,
    createEncoder,
    FixedSizeDecoder,
    FixedSizeEncoder,
    Offset,
} from '@solana/codecs-core';

import { assertNumberIsBetweenForCodec } from './assertions';
import { Endian, NumberCodecConfig } from './common';

type NumberFactorySharedInput = {
    name: string;
    size: number;
    config?: NumberCodecConfig;
};

type NumberFactoryEncoderInput<T> = NumberFactorySharedInput & {
    range?: [number | bigint, number | bigint];
    set: (view: DataView, value: T, littleEndian?: boolean) => void;
};

type NumberFactoryDecoderInput<T> = NumberFactorySharedInput & {
    get: (view: DataView, littleEndian?: boolean) => T;
};

function isLittleEndian(config?: NumberCodecConfig): boolean {
    return config?.endian === Endian.BIG ? false : true;
}

export function numberEncoderFactory<T extends number | bigint>(
    input: NumberFactoryEncoderInput<T>
): FixedSizeEncoder<T> {
    return createEncoder({
        fixedSize: input.size,
        write(value: T, bytes: Uint8Array, offset: Offset): Offset {
            if (input.range) {
                assertNumberIsBetweenForCodec(input.name, input.range[0], input.range[1], value);
            }
            const arrayBuffer = new ArrayBuffer(input.size);
            input.set(new DataView(arrayBuffer), value, isLittleEndian(input.config));
            bytes.set(new Uint8Array(arrayBuffer), offset);
            return offset + input.size;
        },
    });
}

export function numberDecoderFactory<T extends number | bigint>(
    input: NumberFactoryDecoderInput<T>
): FixedSizeDecoder<T> {
    return createDecoder({
        fixedSize: input.size,
        read(bytes, offset = 0): [T, number] {
            assertByteArrayIsNotEmptyForCodec(input.name, bytes, offset);
            assertByteArrayHasEnoughBytesForCodec(input.name, input.size, bytes, offset);
            const view = new DataView(toArrayBuffer(bytes, offset, input.size));
            return [input.get(view, isLittleEndian(input.config)), offset + input.size];
        },
    });
}

/**
 * Helper function to ensure that the ArrayBuffer is converted properly from a Uint8Array
 * Source: https://stackoverflow.com/questions/37228285/uint8array-to-arraybuffer
 */
function toArrayBuffer(bytes: Uint8Array, offset?: number, length?: number): ArrayBuffer {
    const bytesOffset = bytes.byteOffset + (offset ?? 0);
    const bytesLength = length ?? bytes.byteLength;
    return bytes.buffer.slice(bytesOffset, bytesOffset + bytesLength);
}
