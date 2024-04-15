import { getBase64Decoder } from '@solana/codecs-strings';

import { Base64EncodedWireTransaction } from './new-wire-transaction';
import { getTransactionEncoder } from './serializers/transaction';

export function getBase64EncodedWireTransaction(
    transaction: Parameters<ReturnType<typeof getTransactionEncoder>['encode']>[0],
): Base64EncodedWireTransaction {
    const wireTransactionBytes = getTransactionEncoder().encode(transaction);
    return getBase64Decoder().decode(wireTransactionBytes) as Base64EncodedWireTransaction;
}
