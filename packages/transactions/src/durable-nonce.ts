import { Address } from '@solana/addresses';
import { SOLANA_ERROR__TRANSACTION__EXPECTED_NONCE_LIFETIME, SolanaError } from '@solana/errors';
import { AccountRole, IInstruction, isSignerRole } from '@solana/instructions';
import { AdvanceNonceAccountInstruction, getAdvanceNonceAccountInstructionRaw } from '@solana-program/system';

import { ITransactionWithSignatures } from './signatures';
import { BaseTransaction } from './types';
import { getUnsignedTransaction } from './unsigned-transaction';

type DurableNonceConfig<
    TNonceAccountAddress extends string = string,
    TNonceAuthorityAddress extends string = string,
    TNonceValue extends string = string,
> = Readonly<{
    readonly nonce: Nonce<TNonceValue>;
    readonly nonceAccountAddress: Address<TNonceAccountAddress>;
    readonly nonceAuthorityAddress: Address<TNonceAuthorityAddress>;
}>;
export type Nonce<TNonceValue extends string = string> = TNonceValue & { readonly __brand: unique symbol };
type NonceLifetimeConstraint<TNonceValue extends string = string> = Readonly<{
    nonce: Nonce<TNonceValue>;
}>;

const RECENT_BLOCKHASHES_SYSVAR_ADDRESS =
    'SysvarRecentB1ockHashes11111111111111111111' as Address<'SysvarRecentB1ockHashes11111111111111111111'>;
const SYSTEM_PROGRAM_ADDRESS = '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;

export interface IDurableNonceTransaction<
    TNonceAccountAddress extends string = string,
    TNonceAuthorityAddress extends string = string,
    TNonceValue extends string = string,
> {
    readonly instructions: readonly [
        // The first instruction *must* be the system program's `AdvanceNonceAccount` instruction.
        AdvanceNonceAccountInstruction<
            '11111111111111111111111111111111',
            TNonceAccountAddress,
            'SysvarRecentB1ockHashes11111111111111111111',
            TNonceAuthorityAddress
        >,
        ...IInstruction[],
    ];
    readonly lifetimeConstraint: NonceLifetimeConstraint<TNonceValue>;
}

export function assertIsDurableNonceTransaction(
    transaction: BaseTransaction | (BaseTransaction & IDurableNonceTransaction),
): asserts transaction is BaseTransaction & IDurableNonceTransaction {
    if (!isDurableNonceTransaction(transaction)) {
        throw new SolanaError(SOLANA_ERROR__TRANSACTION__EXPECTED_NONCE_LIFETIME);
    }
}

export function isAdvanceNonceAccountInstruction(
    instruction: IInstruction,
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
        isSignerRole(instruction.accounts[2].role)
    );
}

function isAdvanceNonceAccountInstructionData(data: Uint8Array): data is AdvanceNonceAccountInstruction['data'] {
    // AdvanceNonceAccount is the fifth instruction in the System Program (index 4)
    return data.byteLength === 4 && data[0] === 4 && data[1] === 0 && data[2] === 0 && data[3] === 0;
}

function isDurableNonceTransaction(
    transaction: BaseTransaction | (BaseTransaction & IDurableNonceTransaction),
): transaction is BaseTransaction & IDurableNonceTransaction {
    return (
        'lifetimeConstraint' in transaction &&
        typeof transaction.lifetimeConstraint.nonce === 'string' &&
        transaction.instructions[0] != null &&
        isAdvanceNonceAccountInstruction(transaction.instructions[0])
    );
}

function isAdvanceNonceAccountInstructionForNonce<
    TNonceAccountAddress extends Address = Address,
    TNonceAuthorityAddress extends Address = Address,
>(
    instruction: AdvanceNonceAccountInstruction,
    nonceAccountAddress: TNonceAccountAddress,
    nonceAuthorityAddress: TNonceAuthorityAddress,
): instruction is AdvanceNonceAccountInstruction<
    '11111111111111111111111111111111',
    TNonceAccountAddress,
    'SysvarRecentB1ockHashes11111111111111111111',
    TNonceAuthorityAddress
> {
    return (
        instruction.accounts[0].address === nonceAccountAddress &&
        instruction.accounts[2].address === nonceAuthorityAddress
    );
}

export function setTransactionLifetimeUsingDurableNonce<
    TTransaction extends BaseTransaction,
    TNonceAccountAddress extends string = string,
    TNonceAuthorityAddress extends string = string,
    TNonceValue extends string = string,
>(
    {
        nonce,
        nonceAccountAddress,
        nonceAuthorityAddress,
    }: DurableNonceConfig<TNonceAccountAddress, TNonceAuthorityAddress, TNonceValue>,
    transaction: TTransaction | (IDurableNonceTransaction & TTransaction),
): IDurableNonceTransaction<TNonceAccountAddress, TNonceAuthorityAddress, TNonceValue> &
    Omit<TTransaction, keyof ITransactionWithSignatures> {
    let newInstructions: [
        AdvanceNonceAccountInstruction<
            '11111111111111111111111111111111',
            TNonceAccountAddress,
            'SysvarRecentB1ockHashes11111111111111111111',
            TNonceAuthorityAddress
        >,
        ...IInstruction[],
    ];

    const firstInstruction = transaction.instructions[0];
    if (firstInstruction && isAdvanceNonceAccountInstruction(firstInstruction)) {
        if (isAdvanceNonceAccountInstructionForNonce(firstInstruction, nonceAccountAddress, nonceAuthorityAddress)) {
            if (isDurableNonceTransaction(transaction) && transaction.lifetimeConstraint.nonce === nonce) {
                return transaction as IDurableNonceTransaction<
                    TNonceAccountAddress,
                    TNonceAuthorityAddress,
                    TNonceValue
                > &
                    TTransaction;
            } else {
                // we already have the right first instruction, leave it as-is
                newInstructions = [firstInstruction, ...transaction.instructions.slice(1)];
            }
        } else {
            // we have a different advance nonce instruction as the first instruction, replace it
            newInstructions = [
                getAdvanceNonceAccountInstructionRaw({
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore FIXME: https://github.com/solana-program/create-solana-program/issues/19
                    nonceAccount: nonceAccountAddress,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore FIXME: https://github.com/solana-program/create-solana-program/issues/19
                    nonceAuthority: nonceAuthorityAddress,
                }),
                ...transaction.instructions.slice(1),
            ];
        }
    } else {
        // we don't have an existing advance nonce instruction as the first instruction, prepend one
        newInstructions = [
            getAdvanceNonceAccountInstructionRaw({
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore FIXME: https://github.com/solana-program/create-solana-program/issues/19
                nonceAccount: nonceAccountAddress,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore FIXME: https://github.com/solana-program/create-solana-program/issues/19
                nonceAuthority: nonceAuthorityAddress,
            }),
            ...transaction.instructions,
        ];
    }

    const out = {
        ...getUnsignedTransaction(transaction),
        instructions: newInstructions,
        lifetimeConstraint: {
            nonce,
        },
    } as IDurableNonceTransaction<TNonceAccountAddress, TNonceAuthorityAddress, TNonceValue> & TTransaction;
    Object.freeze(out);
    return out;
}
