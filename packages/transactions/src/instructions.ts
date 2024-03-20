import { ITransactionWithSignatures } from './signatures.js';
import { BaseTransaction } from './types.js';
import { getUnsignedTransaction } from './unsigned-transaction.js';

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
        ...getUnsignedTransaction(transaction),
        instructions: [...instructions, ...transaction.instructions],
    };
    Object.freeze(out);
    return out;
}
