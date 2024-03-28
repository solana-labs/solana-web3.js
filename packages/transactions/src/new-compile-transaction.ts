import { Address } from '@solana/addresses';
import { ReadonlyUint8Array } from '@solana/codecs-core';
import { SignatureBytes } from '@solana/keys';

import { CompilableTransaction } from './compilable-transaction';
import { compileTransactionMessage } from './message';
import { getCompiledMessageEncoder } from './serializers/message';

export type TransactionMessageBytes = ReadonlyUint8Array & { readonly __brand: unique symbol };
export type OrderedMap<K extends string, V> = Record<K, V>;

export type NewTransaction = Readonly<{
    messageBytes: TransactionMessageBytes;
    signatures: OrderedMap<Address, SignatureBytes | null>;
}>;

export function compileTransaction(transactionMessage: CompilableTransaction): NewTransaction {
    const compiledMessage = compileTransactionMessage(transactionMessage);
    const messageBytes = getCompiledMessageEncoder().encode(
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
