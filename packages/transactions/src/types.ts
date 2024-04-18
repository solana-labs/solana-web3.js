import { IAccountMeta, IInstruction } from '@solana/instructions';

export type BaseTransaction<
    TVersion extends TransactionVersion = TransactionVersion,
    TInstruction extends IInstruction = IInstruction,
> = Readonly<{
    instructions: readonly TInstruction[];
    version: TVersion;
}>;

type ILegacyInstruction<TProgramAddress extends string = string> = IInstruction<
    TProgramAddress,
    readonly IAccountMeta[]
>;
type LegacyTransaction = BaseTransaction<'legacy', ILegacyInstruction>;
type V0Transaction = BaseTransaction<0, IInstruction>;

export type Transaction = LegacyTransaction | V0Transaction;
export type TransactionVersion = 'legacy' | 0;
