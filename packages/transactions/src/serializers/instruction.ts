import { array, bytes, mapSerializer, Serializer, shortU16, struct, u8 } from '@metaplex-foundation/umi-serializers';

import { getCompiledInstructions } from '../compile-instructions';

type Instruction = ReturnType<typeof getCompiledInstructions>[number];

export function getInstructionCodec(): Serializer<Instruction> {
    return struct([
        [
            'programAddressIndex',
            u8(
                __DEV__
                    ? {
                          description:
                              'The index of the program being called, according to the ' +
                              'well-ordered accounts list for this transaction',
                      }
                    : undefined
            ),
        ],
        [
            'addressIndices',
            mapSerializer(
                array(
                    u8({
                        description: __DEV__
                            ? 'The index of an account, according to the well-ordered accounts ' +
                              'list for this transaction'
                            : '',
                    }),
                    {
                        description: __DEV__
                            ? 'An optional list of account indices, according to the ' +
                              'well-ordered accounts list for this transaction, in the order in ' +
                              'which the program being called expects them'
                            : '',
                        size: shortU16(),
                    }
                ),
                (value: number[] | undefined) => value ?? [],
                value => (value.length ? value : undefined)
            ),
        ],
        [
            'data',
            mapSerializer(
                bytes({
                    description: __DEV__ ? 'An optional buffer of data passed to the instruction' : '',
                    size: shortU16(),
                }),
                (value: Uint8Array | undefined) => value ?? new Uint8Array(0),
                (value: Uint8Array) => (value.byteLength ? value : undefined)
            ),
        ],
    ]);
}
