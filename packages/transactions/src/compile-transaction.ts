import {
    CompilableTransactionMessage,
    compileTransactionMessage,
    getCompiledTransactionMessageEncoder,
    isTransactionMessageWithBlockhashLifetime,
    TransactionMessageWithBlockhashLifetime,
    TransactionMessageWithDurableNonceLifetime,
} from '@solana/transaction-messages';

import {
    TransactionWithBlockhashLifetime,
    TransactionWithDurableNonceLifetime,
    TransactionWithLifetime,
} from './lifetime';
import { SignaturesMap, Transaction, TransactionMessageBytes } from './transaction';

export function compileTransaction(
    transactionMessage: CompilableTransactionMessage & TransactionMessageWithBlockhashLifetime,
): Readonly<Transaction & TransactionWithBlockhashLifetime>;

export function compileTransaction(
    transactionMessage: CompilableTransactionMessage & TransactionMessageWithDurableNonceLifetime,
): Readonly<Transaction & TransactionWithDurableNonceLifetime>;

export function compileTransaction(
    transactionMessage: CompilableTransactionMessage,
): Readonly<Transaction & TransactionWithLifetime>;

export function compileTransaction(
    transactionMessage: CompilableTransactionMessage,
): Readonly<Transaction & TransactionWithLifetime> {
    const compiledMessage = compileTransactionMessage(transactionMessage);
    const messageBytes = getCompiledTransactionMessageEncoder().encode(compiledMessage) as TransactionMessageBytes;

    const transactionSigners = compiledMessage.staticAccounts.slice(0, compiledMessage.header.numSignerAccounts);
    const signatures: SignaturesMap = {};
    for (const signerAddress of transactionSigners) {
        signatures[signerAddress] = null;
    }

    let lifetimeConstraint: TransactionWithLifetime['lifetimeConstraint'];
    if (isTransactionMessageWithBlockhashLifetime(transactionMessage)) {
        lifetimeConstraint = {
            blockhash: transactionMessage.lifetimeConstraint.blockhash,
            lastValidBlockHeight: transactionMessage.lifetimeConstraint.lastValidBlockHeight,
        };
    } else {
        lifetimeConstraint = {
            nonce: transactionMessage.lifetimeConstraint.nonce,
            nonceAccountAddress: transactionMessage.instructions[0].accounts[0].address,
        };
    }

    const transaction: Transaction & TransactionWithLifetime = {
        lifetimeConstraint,
        messageBytes: messageBytes,
        signatures: Object.freeze(signatures),
    };

    return Object.freeze(transaction);
}
