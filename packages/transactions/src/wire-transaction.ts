import { getTransactionEncoder } from './serializers/transaction';

export type Base64EncodedWireTransaction = string & {
    readonly __brand: unique symbol;
};

export function getBase64EncodedWireTransaction(
    transaction: Parameters<ReturnType<typeof getTransactionEncoder>['encode']>[0]
): Base64EncodedWireTransaction {
    const wireTransactionBytes = getTransactionEncoder().encode(transaction);
    if (__NODEJS__) {
        return Buffer.from(wireTransactionBytes).toString('base64') as Base64EncodedWireTransaction;
    } else {
        return (btoa as Window['btoa'])(String.fromCharCode(...wireTransactionBytes)) as Base64EncodedWireTransaction;
    }
}
