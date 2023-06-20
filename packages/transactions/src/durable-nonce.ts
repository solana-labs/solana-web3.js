import { IInstruction, IInstructionWithAccounts, IInstructionWithData } from '@solana/instructions';
import { ReadonlyAccount, ReadonlySignerAccount, WritableAccount } from '@solana/instructions/dist/types/accounts';

type AdvanceNonceAccountInstruction<
    TNonceAccountAddress extends string = string,
    TNonceAuthorityAddress extends string = string
> = IInstruction<'11111111111111111111111111111111'> &
    IInstructionWithAccounts<
        [
            WritableAccount<TNonceAccountAddress>,
            ReadonlyAccount<'SysvarRecentB1ockHashes11111111111111111111'>,
            ReadonlySignerAccount<TNonceAuthorityAddress>
        ]
    > &
    IInstructionWithData<AdvanceNonceAccountInstructionData>;
type AdvanceNonceAccountInstructionData = Uint8Array & {
    readonly __advanceNonceAccountInstructionData: unique symbol;
};
type NonceLifetimeConstraint = Readonly<{
    nonce: string;
}>;

export interface IDurableNonceTransaction<
    TNonceAccountAddress extends string = string,
    TNonceAuthorityAddress extends string = string
> {
    readonly instructions: [
        // The first instruction *must* be the system program's `AdvanceNonceAccount` instruction.
        AdvanceNonceAccountInstruction<TNonceAccountAddress, TNonceAuthorityAddress>,
        ...IInstruction[]
    ];
    readonly lifetimeConstraint: NonceLifetimeConstraint;
}
