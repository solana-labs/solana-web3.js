import { getBase64Decoder } from '@solana/codecs-strings';

import { getNewTransactionEncoder } from './codecs';
import { NewTransaction } from './transaction';

export type Base64EncodedWireTransaction = string & {
    readonly __brand: unique symbol;
};

export function newGetBase64EncodedWireTransaction(transaction: NewTransaction): Base64EncodedWireTransaction {
    const wireTransactionBytes = getNewTransactionEncoder().encode(transaction);
    return getBase64Decoder().decode(wireTransactionBytes) as Base64EncodedWireTransaction;
}
