import { Address } from '@solana/addresses';
import { SignatureBytes } from '@solana/keys';

import { CompilableTransaction } from './compilable-transaction';
import { compileTransactionMessage } from './message';
import { getCompiledMessageEncoder } from './serializers/message';

type TypedArrayMutableProperties = 'copyWithin' | 'fill' | 'reverse' | 'set' | 'sort';
interface ReadonlyUint8Array extends Omit<Uint8Array, TypedArrayMutableProperties> {
    readonly [n: number]: number;
}

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
