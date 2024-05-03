import { TransactionMessage, TransactionVersion } from './transaction-message';

type TransactionConfig<TVersion extends TransactionVersion> = Readonly<{
    version: TVersion;
}>;

export function createTransactionMessage<TVersion extends TransactionVersion>(
    config: TransactionConfig<TVersion>,
): Extract<TransactionMessage, { version: TVersion }>;
export function createTransactionMessage<TVersion extends TransactionVersion>({
    version,
}: TransactionConfig<TVersion>): TransactionMessage {
    return Object.freeze({
        instructions: Object.freeze([]),
        version,
    }) as TransactionMessage;
}
