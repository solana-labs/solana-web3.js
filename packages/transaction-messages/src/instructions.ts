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
    return Object.freeze({
        ...transaction,
        instructions: Object.freeze([...transaction.instructions, ...instructions]),
    });
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
    return Object.freeze({
        ...transaction,
        instructions: Object.freeze([...instructions, ...transaction.instructions]),
    });
}
