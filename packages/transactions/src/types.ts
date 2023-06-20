import { IAccountMeta, IInstruction } from '@solana/instructions';

export type BaseTransaction = Readonly<{
    instructions: readonly IInstruction[];
    version: TransactionVersion;
}>;

type LegacyTransaction = BaseTransaction &
    Readonly<{
        instructions: readonly (Omit<IInstruction, 'accounts'> &
            Readonly<{ readonly accounts?: readonly IAccountMeta[] }>)[];
        version: 'legacy';
    }>;

type V0Transaction = BaseTransaction &
    Readonly<{
        instructions: readonly IInstruction[];
        version: 0;
    }>;

export type Transaction = LegacyTransaction | V0Transaction;
export type TransactionVersion = 'legacy' | 0;
