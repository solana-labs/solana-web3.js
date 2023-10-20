import { Codec, combineCodec, Decoder, Encoder, mapDecoder, mapEncoder } from '@solana/codecs-core';
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

const programAddressIndexDescription = __DEV__
    ? 'The index of the program being called, according to the well-ordered accounts list for this transaction'
    : 'programAddressIndex';

const accountIndexDescription = __DEV__
    ? 'The index of an account, according to the well-ordered accounts list for this transaction'
    : undefined;

const accountIndicesDescription = __DEV__
    ? 'An optional list of account indices, according to the ' +
      'well-ordered accounts list for this transaction, in the order in ' +
      'which the program being called expects them'
    : 'accountIndices';

const dataDescription = __DEV__ ? 'An optional buffer of data passed to the instruction' : 'data';

let memoizedGetInstructionEncoder: Encoder<Instruction> | undefined;
export function getInstructionEncoder(): Encoder<Instruction> {
    if (!memoizedGetInstructionEncoder) {
        memoizedGetInstructionEncoder = mapEncoder<Required<Instruction>, Instruction>(
            getStructEncoder([
                ['programAddressIndex', getU8Encoder({ description: programAddressIndexDescription })],
                [
                    'accountIndices',
                    getArrayEncoder(getU8Encoder({ description: accountIndexDescription }), {
                        description: accountIndicesDescription,
                        size: getShortU16Encoder(),
                    }),
                ],
                ['data', getBytesEncoder({ description: dataDescription, size: getShortU16Encoder() })],
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
            }
        );
    }

    return memoizedGetInstructionEncoder;
}

let memoizedGetInstructionDecoder: Decoder<Instruction> | undefined;
export function getInstructionDecoder(): Decoder<Instruction> {
    if (!memoizedGetInstructionDecoder) {
        memoizedGetInstructionDecoder = mapDecoder<Required<Instruction>, Instruction>(
            getStructDecoder([
                ['programAddressIndex', getU8Decoder({ description: programAddressIndexDescription })],
                [
                    'accountIndices',
                    getArrayDecoder(getU8Decoder({ description: accountIndexDescription }), {
                        description: accountIndicesDescription,
                        size: getShortU16Decoder(),
                    }),
                ],
                ['data', getBytesDecoder({ description: dataDescription, size: getShortU16Decoder() })],
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
            }
        );
    }
    return memoizedGetInstructionDecoder;
}

export function getInstructionCodec(): Codec<Instruction> {
    return combineCodec(getInstructionEncoder(), getInstructionDecoder());
}
