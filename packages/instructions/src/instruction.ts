import { Address } from '@solana/addresses';

import { IAccountLookupMeta, IAccountMeta } from './accounts';

export interface IInstruction<
    TProgramAddress extends string = string,
    TAccounts extends readonly (IAccountMeta | IAccountLookupMeta)[] = readonly (IAccountMeta | IAccountLookupMeta)[]
> {
    readonly accounts?: TAccounts;
    readonly data?: Uint8Array;
    readonly programAddress: Address<TProgramAddress>;
}

export interface IInstructionWithAccounts<TAccounts extends readonly (IAccountMeta | IAccountLookupMeta)[]>
    extends IInstruction {
    readonly accounts: TAccounts;
}

export interface IInstructionWithData<TData extends Uint8Array> extends IInstruction {
    readonly data: TData;
}
