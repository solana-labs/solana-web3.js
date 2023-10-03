import { Base58EncodedAddress } from '@solana/addresses';
import { AccountRole, IInstruction, IInstructionWithAccounts, IInstructionWithData } from '@solana/instructions';
import { ReadonlyAccount, ReadonlySignerAccount, WritableAccount } from '@solana/instructions/dist/types/accounts';

import { ITransactionWithSignatures } from './signatures';
import { BaseTransaction } from './types';
import { getUnsignedTransaction } from './unsigned-transaction';

type AdvanceNonceAccountInstruction<
    TNonceAccountAddress extends string = string,
    TNonceAuthorityAddress extends string = string
> = IInstruction<'11111111111111111111111111111111'> &
    IInstructionWithAccounts<
        readonly [
            WritableAccount<TNonceAccountAddress>,
            ReadonlyAccount<'SysvarRecentB1ockHashes11111111111111111111'>,
            ReadonlySignerAccount<TNonceAuthorityAddress>
        ]
    > &
    IInstructionWithData<AdvanceNonceAccountInstructionData>;
type AdvanceNonceAccountInstructionData = Uint8Array & {
    readonly __brand: unique symbol;
};
type DurableNonceConfig<
    TNonceAccountAddress extends string = string,
    TNonceAuthorityAddress extends string = string,
    TNonceValue extends string = string
> = Readonly<{
    readonly nonce: Nonce<TNonceValue>;
    readonly nonceAccountAddress: Base58EncodedAddress<TNonceAccountAddress>;
    readonly nonceAuthorityAddress: Base58EncodedAddress<TNonceAuthorityAddress>;
}>;
export type Nonce<TNonceValue extends string = string> = TNonceValue & { readonly __brand: unique symbol };
type NonceLifetimeConstraint<TNonceValue extends string = string> = Readonly<{
    nonce: Nonce<TNonceValue>;
}>;

const RECENT_BLOCKHASHES_SYSVAR_ADDRESS =
    'SysvarRecentB1ockHashes11111111111111111111' as Base58EncodedAddress<'SysvarRecentB1ockHashes11111111111111111111'>;
const SYSTEM_PROGRAM_ADDRESS =
    '11111111111111111111111111111111' as Base58EncodedAddress<'11111111111111111111111111111111'>;

export interface IDurableNonceTransaction<
    TNonceAccountAddress extends string = string,
    TNonceAuthorityAddress extends string = string,
    TNonceValue extends string = string
> {
    readonly instructions: readonly [
        // The first instruction *must* be the system program's `AdvanceNonceAccount` instruction.
        AdvanceNonceAccountInstruction<TNonceAccountAddress, TNonceAuthorityAddress>,
        ...IInstruction[]
    ];
    readonly lifetimeConstraint: NonceLifetimeConstraint<TNonceValue>;
}

export function assertIsDurableNonceTransaction(
    transaction: BaseTransaction | (BaseTransaction & IDurableNonceTransaction)
): asserts transaction is BaseTransaction & IDurableNonceTransaction {
    if (!isDurableNonceTransaction(transaction)) {
        // TODO: Coded error.
        throw new Error('Transaction is not a durable nonce transaction');
    }
}

function createAdvanceNonceAccountInstruction<
    TNonceAccountAddress extends string = string,
    TNonceAuthorityAddress extends string = string
>(
    nonceAccountAddress: Base58EncodedAddress<TNonceAccountAddress>,
    nonceAuthorityAddress: Base58EncodedAddress<TNonceAuthorityAddress>
): AdvanceNonceAccountInstruction<TNonceAccountAddress, TNonceAuthorityAddress> {
    return {
        accounts: [
            { address: nonceAccountAddress, role: AccountRole.WRITABLE },
            {
                address: RECENT_BLOCKHASHES_SYSVAR_ADDRESS,
                role: AccountRole.READONLY,
            },
            { address: nonceAuthorityAddress, role: AccountRole.READONLY_SIGNER },
        ],
        data: new Uint8Array([4, 0, 0, 0]) as AdvanceNonceAccountInstructionData,
        programAddress: SYSTEM_PROGRAM_ADDRESS,
    };
}

export function isAdvanceNonceAccountInstruction(
    instruction: IInstruction
): instruction is AdvanceNonceAccountInstruction {
    return (
        instruction.programAddress === SYSTEM_PROGRAM_ADDRESS &&
        // Test for `AdvanceNonceAccount` instruction data
        instruction.data != null &&
        isAdvanceNonceAccountInstructionData(instruction.data) &&
        // Test for exactly 3 accounts
        instruction.accounts?.length === 3 &&
        // First account is nonce account address
        instruction.accounts[0].address != null &&
        instruction.accounts[0].role === AccountRole.WRITABLE &&
        // Second account is recent blockhashes sysvar
        instruction.accounts[1].address === RECENT_BLOCKHASHES_SYSVAR_ADDRESS &&
        instruction.accounts[1].role === AccountRole.READONLY &&
        // Third account is nonce authority account
        instruction.accounts[2].address != null &&
        instruction.accounts[2].role === AccountRole.READONLY_SIGNER
    );
}

function isAdvanceNonceAccountInstructionData(data: Uint8Array): data is AdvanceNonceAccountInstructionData {
    // AdvanceNonceAccount is the fifth instruction in the System Program (index 4)
    return data.byteLength === 4 && data[0] === 4 && data[1] === 0 && data[2] === 0 && data[3] === 0;
}

function isDurableNonceTransaction(
    transaction: BaseTransaction | (BaseTransaction & IDurableNonceTransaction)
): transaction is BaseTransaction & IDurableNonceTransaction {
    return (
        'lifetimeConstraint' in transaction &&
        typeof transaction.lifetimeConstraint.nonce === 'string' &&
        transaction.instructions[0] != null &&
        isAdvanceNonceAccountInstruction(transaction.instructions[0])
    );
}

export function setTransactionLifetimeUsingDurableNonce<
    TTransaction extends BaseTransaction,
    TNonceAccountAddress extends string = string,
    TNonceAuthorityAddress extends string = string,
    TNonceValue extends string = string
>(
    {
        nonce,
        nonceAccountAddress,
        nonceAuthorityAddress,
    }: DurableNonceConfig<TNonceAccountAddress, TNonceAuthorityAddress, TNonceValue>,
    transaction: TTransaction | (TTransaction & IDurableNonceTransaction)
): Omit<TTransaction, keyof ITransactionWithSignatures> &
    IDurableNonceTransaction<TNonceAccountAddress, TNonceAuthorityAddress, TNonceValue> {
    const isAlreadyDurableNonceTransaction = isDurableNonceTransaction(transaction);
    if (
        isAlreadyDurableNonceTransaction &&
        transaction.lifetimeConstraint.nonce === nonce &&
        transaction.instructions[0].accounts[0].address === nonceAccountAddress &&
        transaction.instructions[0].accounts[2].address === nonceAuthorityAddress
    ) {
        return transaction as TTransaction &
            IDurableNonceTransaction<TNonceAccountAddress, TNonceAuthorityAddress, TNonceValue>;
    }
    const out = {
        ...getUnsignedTransaction(transaction),
        instructions: [
            createAdvanceNonceAccountInstruction(nonceAccountAddress, nonceAuthorityAddress),
            ...(isAlreadyDurableNonceTransaction ? transaction.instructions.slice(1) : transaction.instructions),
        ],
        lifetimeConstraint: {
            nonce,
        },
    } as TTransaction & IDurableNonceTransaction<TNonceAccountAddress, TNonceAuthorityAddress, TNonceValue>;
    Object.freeze(out);
    return out;
}
