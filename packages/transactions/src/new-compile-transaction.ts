import { Address } from '@solana/addresses';
import { ReadonlyUint8Array } from '@solana/codecs-core';
import { SignatureBytes } from '@solana/keys';
import {
    CompilableTransactionMessage,
    getCompiledTransactionMessageEncoder,
    IDurableNonceTransactionMessage,
    isTransactionMessageWithBlockhashLifetime,
    ITransactionMessageWithBlockhashLifetime,
    newCompileTransactionMessage,
} from '@solana/transaction-messages';

import { TransactionBlockhashLifetime, TransactionDurableNonceLifetime, TransactionWithLifetime } from './lifetime';
import { NewTransaction, OrderedMap, TransactionMessageBytes } from './transaction';

export function compileTransaction(
    transactionMessage: CompilableTransactionMessage & ITransactionMessageWithBlockhashLifetime,
): NewTransaction & { lifetimeConstraint: TransactionBlockhashLifetime };

export function compileTransaction(
    transactionMessage: CompilableTransactionMessage & IDurableNonceTransactionMessage,
): NewTransaction & { lifetimeConstraint: TransactionDurableNonceLifetime };

export function compileTransaction(
    transactionMessage: CompilableTransactionMessage,
): NewTransaction & TransactionWithLifetime;

export function compileTransaction(
    transactionMessage: CompilableTransactionMessage,
): NewTransaction & TransactionWithLifetime {
    const compiledMessage = newCompileTransactionMessage(transactionMessage);
    const messageBytes = getCompiledTransactionMessageEncoder().encode(
        compiledMessage,
    ) as ReadonlyUint8Array as TransactionMessageBytes;

    const transactionSigners = compiledMessage.staticAccounts.slice(0, compiledMessage.header.numSignerAccounts);
    const signatures: OrderedMap<Address, SignatureBytes | null> = {};
    for (const signerAddress of transactionSigners) {
        signatures[signerAddress] = null;
    }

    let lifetimeConstraint: TransactionWithLifetime['lifetimeConstraint'];
    console.log({ transactionMessage });
    if (isTransactionMessageWithBlockhashLifetime(transactionMessage)) {
        lifetimeConstraint = {
            blockhash: transactionMessage.lifetimeConstraint.blockhash,
        };
    } else {
        lifetimeConstraint = {
            nonce: transactionMessage.lifetimeConstraint.nonce,
        };
    }

    const transaction: NewTransaction & TransactionWithLifetime = {
        lifetimeConstraint,
        messageBytes: messageBytes as TransactionMessageBytes,
        signatures: Object.freeze(signatures),
    };

    return Object.freeze(transaction);
}
