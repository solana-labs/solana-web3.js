import { Address } from '@solana/addresses';
import { ReadonlyUint8Array } from '@solana/codecs-core';
import { SignatureBytes } from '@solana/keys';
import {
    CompilableTransactionMessage,
    getCompiledTransactionMessageEncoder,
    newCompileTransactionMessage,
} from '@solana/transaction-messages';

import { NewTransaction, OrderedMap, TransactionMessageBytes } from './transaction';

export function compileTransaction(transactionMessage: CompilableTransactionMessage): NewTransaction {
    const compiledMessage = newCompileTransactionMessage(transactionMessage);
    const messageBytes = getCompiledTransactionMessageEncoder().encode(
        compiledMessage,
    ) as ReadonlyUint8Array as TransactionMessageBytes;

    const transactionSigners = compiledMessage.staticAccounts.slice(0, compiledMessage.header.numSignerAccounts);
    const signatures: OrderedMap<Address, SignatureBytes | null> = {};
    for (const signerAddress of transactionSigners) {
        signatures[signerAddress] = null;
    }

    const transaction: NewTransaction = {
        messageBytes: messageBytes as TransactionMessageBytes,
        signatures: Object.freeze(signatures),
    };

    return Object.freeze(transaction);
}
