import { SignatureBytes } from '@solana/keys';

import { CompilableTransaction } from './compilable-transaction.js';
import { CompiledMessage, compileMessage } from './message.js';
import { ITransactionWithSignatures } from './signatures.js';

export type CompiledTransaction = Readonly<{
    compiledMessage: CompiledMessage;
    signatures: SignatureBytes[];
}>;

export function getCompiledTransaction(
    transaction: CompilableTransaction | (CompilableTransaction & ITransactionWithSignatures),
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
