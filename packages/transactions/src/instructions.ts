import { ITransactionWithSignatures } from './signatures';
import { BaseTransaction } from './types';
import { getUnsignedTransaction } from './unsigned-transaction';

export function appendTransactionInstruction<TTransaction extends BaseTransaction>(
    instruction: TTransaction['instructions'][number],
    transaction: TTransaction | (ITransactionWithSignatures & TTransaction),
): Omit<TTransaction, keyof ITransactionWithSignatures> | TTransaction {
    return appendTransactionInstructions([instruction], transaction);
}

export function appendTransactionInstructions<TTransaction extends BaseTransaction>(
    instructions: ReadonlyArray<TTransaction['instructions'][number]>,
    transaction: TTransaction | (ITransactionWithSignatures & TTransaction),
): Omit<TTransaction, keyof ITransactionWithSignatures> | TTransaction {
    const out = {
        // The addition of an instruction implies that any existing signatures are invalid.
        ...getUnsignedTransaction(transaction),
        instructions: [...transaction.instructions, ...instructions],
    };
    Object.freeze(out);
    return out;
}

export function prependTransactionInstruction<TTransaction extends BaseTransaction>(
    instruction: TTransaction['instructions'][number],
    transaction: TTransaction | (ITransactionWithSignatures & TTransaction),
): Omit<TTransaction, keyof ITransactionWithSignatures> | TTransaction {
    return prependTransactionInstructions([instruction], transaction);
}

export function prependTransactionInstructions<TTransaction extends BaseTransaction>(
    instructions: ReadonlyArray<TTransaction['instructions'][number]>,
    transaction: TTransaction | (ITransactionWithSignatures & TTransaction),
): Omit<TTransaction, keyof ITransactionWithSignatures> | TTransaction {
    const out = {
        // The addition of an instruction implies that any existing signatures are invalid.
        ...getUnsignedTransaction(transaction),
        instructions: [...instructions, ...transaction.instructions],
    };
    Object.freeze(out);
    return out;
}
