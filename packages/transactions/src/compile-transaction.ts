import { Ed25519Signature } from '@solana/keys';

import { CompiledMessage, compileMessage } from './message';
import { ITransactionWithSignatures } from './signatures';

type CompiledTransaction = Readonly<{
    compiledMessage: CompiledMessage;
    signatures: Ed25519Signature[];
}>;

type CompilableTransaction = Parameters<typeof compileMessage>[0];

export function getCompiledTransaction(
    transaction: CompilableTransaction | (CompilableTransaction & ITransactionWithSignatures)
): CompiledTransaction {
    const compiledMessage = compileMessage(transaction);
    let signatures;
    if ('signatures' in transaction) {
        signatures = [];
        for (let ii = 0; ii < compiledMessage.header.numSignerAccounts; ii++) {
            signatures[ii] =
                transaction.signatures[compiledMessage.staticAccounts[ii]] ?? new Uint8Array(Array(64).fill(0));
        }
    } else {
        signatures = Array(compiledMessage.header.numSignerAccounts).fill(new Uint8Array(Array(64).fill(0)));
    }
    return {
        compiledMessage,
        signatures,
    };
}
