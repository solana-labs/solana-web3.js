/* eslint-disable @typescript-eslint/no-floating-promises */
import { Signature } from '@solana/keys';

import {
    assertTransactionIsFullySigned,
    FullySignedTransaction,
    getSignatureFromTransaction,
    partiallySignTransaction,
    signTransaction,
} from '..';
import { Transaction } from '../transaction';

// getSignatureFromTransaction
{
    const transaction = null as unknown as Transaction & { some: 1 };
    getSignatureFromTransaction(transaction) satisfies Signature;
}

// partiallySignTransaction
{
    const transaction = null as unknown as Transaction & { some: 1 };
    partiallySignTransaction([], transaction) satisfies Promise<Transaction & { some: 1 }>;
}

// signTransaction
{
    const transaction = null as unknown as Transaction & { some: 1 };
    signTransaction([], transaction) satisfies Promise<FullySignedTransaction & { some: 1 }>;
}

// assertTransactionIsFullySigned
{
    const transaction = null as unknown as Transaction & { some: 1 };
    assertTransactionIsFullySigned(transaction);
    transaction satisfies FullySignedTransaction & { some: 1 };
}
