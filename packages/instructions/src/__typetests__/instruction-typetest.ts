import { IAccountLookupMeta, IAccountMeta } from '../accounts';
import {
    assertIsInstructionWithAccounts,
    assertIsInstructionWithData,
    IInstruction,
    IInstructionWithAccounts,
    IInstructionWithData,
    isInstructionWithAccounts,
    isInstructionWithData,
} from '../instruction';

// narrowing using if checks
{
    const instruction = {} as unknown as IInstruction;

    // @ts-expect-error instruction might not have accounts
    instruction satisfies IInstructionWithAccounts<readonly (IAccountMeta | IAccountLookupMeta)[]>;

    // @ts-expect-error instruction might not have data
    instruction satisfies IInstructionWithData<Uint8Array>;

    if (isInstructionWithAccounts(instruction) && isInstructionWithData(instruction)) {
        instruction satisfies IInstruction &
            IInstructionWithAccounts<readonly (IAccountMeta | IAccountLookupMeta)[]> &
            IInstructionWithData<Uint8Array>;
    }
}

// narrowing using assertions
{
    const instruction = {} as unknown as IInstruction;

    // @ts-expect-error instruction might not have accounts
    instruction satisfies IInstructionWithAccounts<readonly (IAccountMeta | IAccountLookupMeta)[]>;

    // @ts-expect-error instruction might not have data
    instruction satisfies IInstructionWithData<Uint8Array>;

    assertIsInstructionWithAccounts(instruction);
    instruction satisfies IInstruction & IInstructionWithAccounts<readonly (IAccountMeta | IAccountLookupMeta)[]>;

    assertIsInstructionWithData(instruction);
    instruction satisfies IInstruction &
        IInstructionWithAccounts<readonly (IAccountMeta | IAccountLookupMeta)[]> &
        IInstructionWithData<Uint8Array>;
}
