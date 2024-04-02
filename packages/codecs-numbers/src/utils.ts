import {
    assertByteArrayHasEnoughBytesForCodec,
    assertByteArrayIsNotEmptyForCodec,
    createDecoder,
    createEncoder,
    FixedSizeDecoder,
    FixedSizeEncoder,
    Offset,
    ReadonlyUint8Array,
} from '@solana/codecs-core';

import { assertNumberIsBetweenForCodec } from './assertions';
import { Endian, NumberCodecConfig } from './common';

type NumberFactorySharedInput<TSize extends number> = {
    config?: NumberCodecConfig;
    name: string;
    size: TSize;
};

type NumberFactoryEncoderInput<TFrom, TSize extends number> = NumberFactorySharedInput<TSize> & {
    range?: [bigint | number, bigint | number];
    set: (view: DataView, value: TFrom, littleEndian?: boolean) => void;
};

type NumberFactoryDecoderInput<TTo, TSize extends number> = NumberFactorySharedInput<TSize> & {
    get: (view: DataView, littleEndian?: boolean) => TTo;
};

function isLittleEndian(config?: NumberCodecConfig): boolean {
    return config?.endian === Endian.Big ? false : true;
}

export function numberEncoderFactory<TFrom extends bigint | number, TSize extends number>(
    input: NumberFactoryEncoderInput<TFrom, TSize>,
): FixedSizeEncoder<TFrom, TSize> {
    return createEncoder({
        fixedSize: input.size,
        write(value: TFrom, bytes: Uint8Array, offset: Offset): Offset {
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

export function numberDecoderFactory<TTo extends bigint | number, TSize extends number>(
    input: NumberFactoryDecoderInput<TTo, TSize>,
): FixedSizeDecoder<TTo, TSize> {
    return createDecoder({
        fixedSize: input.size,
        read(bytes, offset = 0): [TTo, number] {
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
function toArrayBuffer(bytes: ReadonlyUint8Array | Uint8Array, offset?: number, length?: number): ArrayBuffer {
    const bytesOffset = bytes.byteOffset + (offset ?? 0);
    const bytesLength = length ?? bytes.byteLength;
    return bytes.buffer.slice(bytesOffset, bytesOffset + bytesLength);
}
