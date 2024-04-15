import { Signature } from '@solana/keys';

import {
    FullySignedTransaction,
    newAssertTransactionIsFullySigned,
    newGetSignatureFromTransaction,
    newPartiallySignTransaction,
    newSignTransaction,
} from '..';
import { NewTransaction } from '../transaction';

// getSignatureFromTransaction
{
    const transaction = null as unknown as NewTransaction & { some: 1 };
    newGetSignatureFromTransaction(transaction) satisfies Signature;
}

// partiallySignTransaction
{
    const transaction = null as unknown as NewTransaction & { some: 1 };
    newPartiallySignTransaction([], transaction) satisfies Promise<NewTransaction & { some: 1 }>;
}

// signTransaction
{
    const transaction = null as unknown as NewTransaction & { some: 1 };
    newSignTransaction([], transaction) satisfies Promise<FullySignedTransaction & { some: 1 }>;
}

// assertTransactionIsFullySigned
{
    const transaction = null as unknown as NewTransaction & { some: 1 };
    newAssertTransactionIsFullySigned(transaction);
    transaction satisfies FullySignedTransaction & { some: 1 };
}
