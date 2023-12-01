import { getBase64Decoder } from '@solana/codecs-strings';

import { getTransactionEncoder } from './serializers/transaction';

export type Base64EncodedWireTransaction = string & {
    readonly __brand: unique symbol;
};

export function getBase64EncodedWireTransaction(
    transaction: Parameters<ReturnType<typeof getTransactionEncoder>['encode']>[0],
): Base64EncodedWireTransaction {
    const wireTransactionBytes = getTransactionEncoder().encode(transaction);
    return getBase64Decoder().decode(wireTransactionBytes) as Base64EncodedWireTransaction;
}
