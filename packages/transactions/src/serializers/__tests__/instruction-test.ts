import { getInstructionCodec } from '../instruction';

describe('Instruction codec', () => {
    let instruction: ReturnType<typeof getInstructionCodec>;
    beforeEach(() => {
        instruction = getInstructionCodec();
    });
    it('serializes an instruction according to spec', () => {
        expect(
            instruction.serialize({
                addressIndices: [1, 2],
                data: new Uint8Array([4, 5, 6]),
                programAddressIndex: 7,
            })
        ).toEqual(
            new Uint8Array([
                // Program id index
                7,
                // Compact array of account indices
                2, // Compact-u16 length
                1,
                2,
                // Compact array of instruction data
                3, // Compact-u16 length
                4,
                5,
                6,
            ])
        );
    });
    it('serializes a zero-length compact array when `addressIndices` is `undefined`', () => {
        expect(
            instruction.serialize({
                data: new Uint8Array([3, 4]),
                programAddressIndex: 1,
            })
        ).toEqual(
            new Uint8Array([
                // Program id index
                1,
                // Compact array of account indices
                0, // Compact-u16 length
                // Compact array of instruction data
                2, // Compact-u16 length
                3,
                4,
            ])
        );
    });
    it('serializes a zero-length compact array when `data` is `undefined`', () => {
        expect(
            instruction.serialize({
                addressIndices: [3, 4],
                programAddressIndex: 1,
            })
        ).toEqual(
            new Uint8Array([
                // Program id index
                1,
                // Compact array of account indices
                2, // Compact-u16 length
                3,
                4,
                // Compact array of instruction data
                0, // Compact-u16 length
            ])
        );
    });
    it('deserializes an instruction according to spec', () => {
        expect(
            instruction.deserialize(
                new Uint8Array([
                    // Program id index
                    1,
                    // Compact array of account indices
                    2, // Compact-u16 length
                    3,
                    4,
                    // Compact array of instruction data
                    5, // Compact-u16 length
                    6,
                    7,
                    8,
                    9,
                    10,
                ])
            )[0]
        ).toEqual({
            addressIndices: [3, 4],
            data: new Uint8Array([6, 7, 8, 9, 10]),
            programAddressIndex: 1,
        });
    });
    it('omits the `addressIndices` property when the indices data is zero-length', () => {
        expect(
            instruction.deserialize(
                new Uint8Array([
                    // Program id index
                    1,
                    // Compact array of account indices
                    0, // Compact-u16 length
                    // Compact array of instruction data
                    2, // Compact-u16 length
                    3,
                    4,
                ])
            )[0]
        ).not.toHaveProperty('addressIndices');
    });
    it('omits the `data` property when the instruction data is zero-length', () => {
        expect(
            instruction.deserialize(
                new Uint8Array([
                    // Program id index
                    1,
                    // Compact array of account indices
                    2, // Compact-u16 length
                    3,
                    4,
                    // Compact array of instruction data
                    0, // Compact-u16 length
                ])
            )[0]
        ).not.toHaveProperty('data');
    });
});
