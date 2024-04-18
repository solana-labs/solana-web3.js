import { getBase64Decoder } from '@solana/codecs-strings';

import { getTransactionEncoder } from './codecs';
import { NewTransaction } from './transaction';

export type Base64EncodedWireTransaction = string & {
    readonly __brand: unique symbol;
};

export function getBase64EncodedWireTransaction(transaction: NewTransaction): Base64EncodedWireTransaction {
    const wireTransactionBytes = getTransactionEncoder().encode(transaction);
    return getBase64Decoder().decode(wireTransactionBytes) as Base64EncodedWireTransaction;
}
