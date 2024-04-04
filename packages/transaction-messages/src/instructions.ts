import { BaseTransactionMessage } from './transaction-message';

export function appendTransactionMessageInstruction<TTransaction extends BaseTransactionMessage>(
    instruction: TTransaction['instructions'][number],
    transaction: TTransaction,
): TTransaction {
    return appendTransactionMessageInstructions([instruction], transaction);
}

export function appendTransactionMessageInstructions<TTransaction extends BaseTransactionMessage>(
    instructions: ReadonlyArray<TTransaction['instructions'][number]>,
    transaction: TTransaction,
): TTransaction {
    const out = {
        ...transaction,
        instructions: [...transaction.instructions, ...instructions],
    };
    Object.freeze(out);
    return out;
}

export function prependTransactionMessageInstruction<TTransaction extends BaseTransactionMessage>(
    instruction: TTransaction['instructions'][number],
    transaction: TTransaction,
): TTransaction {
    return prependTransactionMessageInstructions([instruction], transaction);
}

export function prependTransactionMessageInstructions<TTransaction extends BaseTransactionMessage>(
    instructions: ReadonlyArray<TTransaction['instructions'][number]>,
    transaction: TTransaction,
): TTransaction {
    const out = {
        ...transaction,
        instructions: [...instructions, ...transaction.instructions],
    };
    Object.freeze(out);
    return out;
}
