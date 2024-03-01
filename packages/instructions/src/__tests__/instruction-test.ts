import { Address } from '@solana/addresses';
import { SolanaError } from '@solana/errors';

import {
    assertIsInstructionForProgram,
    assertIsInstructionWithAccounts,
    assertIsInstructionWithData,
    IInstruction,
    isInstructionForProgram,
    isInstructionWithAccounts,
    isInstructionWithData,
} from '../instruction';
import { AccountRole } from '../roles';

const programAddress = 'address' as Address;

describe('isInstructionForProgram', () => {
    it('returns true when the instruction has the given program address', () => {
        const instruction: IInstruction = {
            programAddress,
        };
        expect(isInstructionForProgram(instruction, programAddress)).toBe(true);
    });

    it('returns false when the instruction does not have the given program address', () => {
        const instruction: IInstruction = {
            programAddress,
        };
        const address = 'abc' as Address;
        expect(isInstructionForProgram(instruction, address)).toBe(false);
    });
});

describe('assertIsInstructionForProgram', () => {
    it('does not throw when the instruction has the given program address', () => {
        const instruction: IInstruction = {
            programAddress,
        };
        const assert = () => assertIsInstructionForProgram(instruction, programAddress);
        expect(assert).not.toThrow();
    });

    it('throws when the instruction does not have the given program address', () => {
        const instruction: IInstruction = {
            programAddress,
        };
        const address = 'abc' as Address;
        const assert = () => assertIsInstructionForProgram(instruction, address);
        expect(assert).toThrow(SolanaError);
    });
});

describe('isInstructionWithAccounts', () => {
    it('returns true when the instruction has an array of accounts', () => {
        const instruction: IInstruction = {
            accounts: [
                {
                    address: 'abc' as Address,
                    role: AccountRole.READONLY,
                },
            ],
            programAddress,
        };
        expect(isInstructionWithAccounts(instruction)).toBe(true);
    });

    it('returns true when the instruction has an empty array of accounts', () => {
        const instruction: IInstruction = {
            accounts: [],
            programAddress,
        };
        expect(isInstructionWithAccounts(instruction)).toBe(true);
    });

    it('returns false when the instruction does not have accounts defined', () => {
        const instruction: IInstruction = {
            programAddress,
        };
        expect(isInstructionWithAccounts(instruction)).toBe(false);
    });
});

describe('assertIsInstructionWithAccounts', () => {
    it('does not throw when the instruction has an array of accounts', () => {
        const instruction: IInstruction = {
            accounts: [
                {
                    address: 'abc' as Address,
                    role: AccountRole.READONLY,
                },
            ],
            programAddress,
        };
        const assert = () => assertIsInstructionWithAccounts(instruction);
        expect(assert).not.toThrow();
    });

    it('does not throw when the instruction has an empty array of accounts', () => {
        const instruction: IInstruction = {
            accounts: [],
            programAddress,
        };
        const assert = () => assertIsInstructionWithAccounts(instruction);
        expect(assert).not.toThrow();
    });

    it('throws when the instruction does not have accounts defined', () => {
        const instruction: IInstruction = {
            programAddress,
        };
        const assert = () => assertIsInstructionWithAccounts(instruction);
        expect(assert).toThrow(SolanaError);
    });
});

describe('isInstructionWithData', () => {
    it('returns true when the instruction has a non-empty data', () => {
        const instruction: IInstruction = {
            data: new Uint8Array([1, 2, 3, 4]),
            programAddress,
        };
        expect(isInstructionWithData(instruction)).toBe(true);
    });

    it('returns true when the instruction has an empty data', () => {
        const instruction: IInstruction = {
            data: new Uint8Array([]),
            programAddress,
        };
        expect(isInstructionWithData(instruction)).toBe(true);
    });

    it('returns false when the instruction does not have data defined', () => {
        const instruction: IInstruction = {
            programAddress,
        };
        expect(isInstructionWithData(instruction)).toBe(false);
    });
});

describe('assertIsInstructionWithData', () => {
    it('does not throw when the instruction has a non-empty data', () => {
        const instruction: IInstruction = {
            data: new Uint8Array([1, 2, 3, 4]),
            programAddress,
        };
        const assert = () => assertIsInstructionWithData(instruction);
        expect(assert).not.toThrow();
    });

    it('does not throw when the instruction has an empty data', () => {
        const instruction: IInstruction = {
            data: new Uint8Array([]),
            programAddress,
        };
        const assert = () => assertIsInstructionWithData(instruction);
        expect(assert).not.toThrow();
    });

    it('throws when the instruction does not have data defined', () => {
        const instruction: IInstruction = {
            programAddress,
        };
        const assert = () => assertIsInstructionWithData(instruction);
        expect(assert).toThrow(SolanaError);
    });
});
