import { Signature } from '@solana/keys';

import {
    assertTransactionIsFullySigned,
    FullySignedTransaction,
    getSignatureFromTransaction,
    partiallySignTransaction,
    signTransaction,
} from '..';
import { NewTransaction } from '../transaction';

// getSignatureFromTransaction
{
    const transaction = null as unknown as NewTransaction & { some: 1 };
    getSignatureFromTransaction(transaction) satisfies Signature;
}

// partiallySignTransaction
{
    const transaction = null as unknown as NewTransaction & { some: 1 };
    partiallySignTransaction([], transaction) satisfies Promise<NewTransaction & { some: 1 }>;
}

// signTransaction
{
    const transaction = null as unknown as NewTransaction & { some: 1 };
    signTransaction([], transaction) satisfies Promise<FullySignedTransaction & { some: 1 }>;
}

// assertTransactionIsFullySigned
{
    const transaction = null as unknown as NewTransaction & { some: 1 };
    assertTransactionIsFullySigned(transaction);
    transaction satisfies FullySignedTransaction & { some: 1 };
}
