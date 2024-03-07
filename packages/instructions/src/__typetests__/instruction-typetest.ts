import { Address } from '@solana/addresses';

import { IAccountLookupMeta, IAccountMeta } from '../accounts';
import {
    assertIsInstructionForProgram,
    assertIsInstructionWithAccounts,
    assertIsInstructionWithData,
    IInstruction,
    IInstructionWithAccounts,
    IInstructionWithData,
    isInstructionForProgram,
    isInstructionWithAccounts,
    isInstructionWithData,
} from '../instruction';

// narrowing using if checks
{
    const instruction = {} as unknown as IInstruction;

    // @ts-expect-error instruction might not have accounts
    instruction satisfies IInstructionWithAccounts<readonly (IAccountLookupMeta | IAccountMeta)[]>;

    // @ts-expect-error instruction might not have data
    instruction satisfies IInstructionWithData<Uint8Array>;

    if (isInstructionWithAccounts(instruction) && isInstructionWithData(instruction)) {
        instruction satisfies IInstruction &
            IInstructionWithAccounts<readonly (IAccountLookupMeta | IAccountMeta)[]> &
            IInstructionWithData<Uint8Array>;
    }
}

// narrowing using assertions
{
    const instruction = {} as unknown as IInstruction;

    // @ts-expect-error instruction might not have accounts
    instruction satisfies IInstructionWithAccounts<readonly (IAccountLookupMeta | IAccountMeta)[]>;

    // @ts-expect-error instruction might not have data
    instruction satisfies IInstructionWithData<Uint8Array>;

    assertIsInstructionWithAccounts(instruction);
    instruction satisfies IInstruction & IInstructionWithAccounts<readonly (IAccountLookupMeta | IAccountMeta)[]>;

    assertIsInstructionWithData(instruction);
    instruction satisfies IInstruction &
        IInstructionWithAccounts<readonly (IAccountLookupMeta | IAccountMeta)[]> &
        IInstructionWithData<Uint8Array>;
}

// narrowing by program address
{
    const instruction = {} as unknown as IInstruction;
    const myAddress = '1111' as Address<'1111'>;
    type MyAddress = typeof myAddress;

    // @ts-expect-error instruction might not have the right address
    instruction satisfies IInstruction<MyAddress>;

    if (isInstructionForProgram(instruction, myAddress)) {
        instruction satisfies IInstruction<MyAddress>;
        instruction satisfies IInstruction<'1111'>;
    }

    assertIsInstructionForProgram(instruction, myAddress);
    instruction satisfies IInstruction<MyAddress>;
    instruction satisfies IInstruction<'1111'>;
}
