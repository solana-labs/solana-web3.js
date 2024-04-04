import {
    addDecoderSizePrefix,
    addEncoderSizePrefix,
    combineCodec,
    transformDecoder,
    transformEncoder,
    VariableSizeCodec,
    VariableSizeDecoder,
    VariableSizeEncoder,
} from '@solana/codecs-core';
import {
    getArrayDecoder,
    getArrayEncoder,
    getBytesDecoder,
    getBytesEncoder,
    getStructDecoder,
    getStructEncoder,
} from '@solana/codecs-data-structures';
import { getShortU16Decoder, getShortU16Encoder, getU8Decoder, getU8Encoder } from '@solana/codecs-numbers';

import { getCompiledInstructions } from '../compile-instructions';

type Instruction = ReturnType<typeof getCompiledInstructions>[number];

let memoizedGetInstructionEncoder: VariableSizeEncoder<Instruction> | undefined;
export function getInstructionEncoder(): VariableSizeEncoder<Instruction> {
    if (!memoizedGetInstructionEncoder) {
        memoizedGetInstructionEncoder = transformEncoder<Required<Instruction>, Instruction>(
            getStructEncoder([
                ['programAddressIndex', getU8Encoder()],
                ['accountIndices', getArrayEncoder(getU8Encoder(), { size: getShortU16Encoder() })],
                ['data', addEncoderSizePrefix(getBytesEncoder(), getShortU16Encoder())],
            ]),
            // Convert an instruction to have all fields defined
            (instruction: Instruction): Required<Instruction> => {
                if (instruction.accountIndices !== undefined && instruction.data !== undefined) {
                    return instruction as Required<Instruction>;
                }
                return {
                    ...instruction,
                    accountIndices: instruction.accountIndices ?? [],
                    data: instruction.data ?? new Uint8Array(0),
                } as Required<Instruction>;
            },
        );
    }

    return memoizedGetInstructionEncoder;
}

let memoizedGetInstructionDecoder: VariableSizeDecoder<Instruction> | undefined;
export function getInstructionDecoder(): VariableSizeDecoder<Instruction> {
    if (!memoizedGetInstructionDecoder) {
        memoizedGetInstructionDecoder = transformDecoder<Required<Instruction>, Instruction>(
            getStructDecoder([
                ['programAddressIndex', getU8Decoder()],
                ['accountIndices', getArrayDecoder(getU8Decoder(), { size: getShortU16Decoder() })],
                [
                    'data',
                    addDecoderSizePrefix(getBytesDecoder(), getShortU16Decoder()) as VariableSizeDecoder<Uint8Array>,
                ],
            ]),
            // Convert an instruction to exclude optional fields if they are empty
            (instruction: Required<Instruction>): Instruction => {
                if (instruction.accountIndices.length && instruction.data.byteLength) {
                    return instruction;
                }
                const { accountIndices, data, ...rest } = instruction;
                return {
                    ...rest,
                    ...(accountIndices.length ? { accountIndices } : null),
                    ...(data.byteLength ? { data } : null),
                };
            },
        );
    }
    return memoizedGetInstructionDecoder;
}

export function getInstructionCodec(): VariableSizeCodec<Instruction> {
    return combineCodec(getInstructionEncoder(), getInstructionDecoder());
}
