import { ITransactionWithSignatures } from './signatures';
import { BaseTransaction } from './types';

function replaceInstructions<TTransaction extends BaseTransaction, TInstructions>(
    transaction: TTransaction | (TTransaction & ITransactionWithSignatures),
    nextInstructions: TInstructions
): TTransaction | Omit<TTransaction, keyof ITransactionWithSignatures> {
    let out;
    if ('signatures' in transaction) {
        // The implication of the instructions changing is that any existing signatures are invalid.
        const {
            signatures: _, // eslint-disable-line @typescript-eslint/no-unused-vars
            ...unsignedTransaction
        } = transaction;
        out = {
            ...unsignedTransaction,
            instructions: nextInstructions,
        };
    } else {
        out = {
            ...transaction,
            instructions: nextInstructions,
        };
    }
    return out;
}

export function appendTransactionInstruction<TTransaction extends BaseTransaction>(
    instruction: TTransaction['instructions'][number],
    transaction: TTransaction | (TTransaction & ITransactionWithSignatures)
): TTransaction | Omit<TTransaction, keyof ITransactionWithSignatures> {
    const nextInstructions = [...transaction.instructions, instruction] as const;
    const out = replaceInstructions(transaction, nextInstructions);
    Object.freeze(out);
    return out;
}

export function prependTransactionInstruction<TTransaction extends BaseTransaction>(
    instruction: TTransaction['instructions'][number],
    transaction: TTransaction | (TTransaction & ITransactionWithSignatures)
): TTransaction | Omit<TTransaction, keyof ITransactionWithSignatures> {
    const nextInstructions = [instruction, ...transaction.instructions] as const;
    const out = replaceInstructions(transaction, nextInstructions);
    Object.freeze(out);
    return out;
}
