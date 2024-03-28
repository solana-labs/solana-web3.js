import { Address } from '@solana/addresses';
import { ReadonlyUint8Array, SignatureBytes } from '@solana/keys';

import { CompilableTransaction } from './compilable-transaction';
import { compileMessage } from './message';
import { getCompiledMessageEncoder } from './serializers/message';

export type TransactionMessageBytes = ReadonlyUint8Array & { readonly __brand: unique symbol };
export type OrderedMap<K extends string, V> = Record<K, V>;

export type NewTransaction = Readonly<{
    messageBytes: TransactionMessageBytes;
    signatures: OrderedMap<Address, SignatureBytes | null>;
}>;

export function compileTransactionMessage(transactionMessage: CompilableTransaction): NewTransaction {
    const compiledMessage = compileMessage(transactionMessage);
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
        signatures,
    };

    return Object.freeze(transaction);
}
