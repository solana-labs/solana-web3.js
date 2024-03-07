import { IInstruction, isSignerRole } from '@solana/instructions';
import { BaseTransaction } from '@solana/transactions';

import { IAccountSignerMeta, IInstructionWithSigners, ITransactionWithSigners } from './account-signer-meta';
import { deduplicateSigners } from './deduplicate-signers';
import { TransactionSigner } from './transaction-signer';

/** Attaches the provided signers to the account metas of an instruction when applicable. */
export function addSignersToInstruction<TInstruction extends IInstruction>(
    signers: TransactionSigner[],
    instruction: TInstruction | (IInstructionWithSigners & TInstruction),
): IInstructionWithSigners & TInstruction {
    if (!instruction.accounts || instruction.accounts.length === 0) {
        return instruction as IInstructionWithSigners & TInstruction;
    }

    const signerByAddress = new Map(deduplicateSigners(signers).map(signer => [signer.address, signer]));
    return Object.freeze({
        ...instruction,
        accounts: instruction.accounts.map(account => {
            const signer = signerByAddress.get(account.address);
            if (!isSignerRole(account.role) || 'signer' in account || !signer) {
                return account;
            }
            return Object.freeze({ ...account, signer } as IAccountSignerMeta);
        }),
    });
}

/** Attaches the provided signers to the account metas of a transaction when applicable. */
export function addSignersToTransaction<TTransaction extends BaseTransaction>(
    signers: TransactionSigner[],
    transaction: TTransaction | (ITransactionWithSigners & TTransaction),
): ITransactionWithSigners & TTransaction {
    if (transaction.instructions.length === 0) {
        return transaction as ITransactionWithSigners & TTransaction;
    }

    return Object.freeze({
        ...transaction,
        instructions: transaction.instructions.map(instruction => addSignersToInstruction(signers, instruction)),
    });
}
