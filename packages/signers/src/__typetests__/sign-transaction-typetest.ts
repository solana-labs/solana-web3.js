import { SignatureBytes } from '@solana/keys';
import {
    CompilableTransactionMessage,
    TransactionMessageWithBlockhashLifetime,
    TransactionMessageWithDurableNonceLifetime,
} from '@solana/transaction-messages';
import {
    FullySignedTransaction,
    Transaction,
    TransactionWithBlockhashLifetime,
    TransactionWithDurableNonceLifetime,
    TransactionWithLifetime,
} from '@solana/transactions';

import { ITransactionMessageWithSigners } from '../account-signer-meta';
import {
    partiallySignTransactionMessageWithSigners,
    signAndSendTransactionMessageWithSigners,
    signTransactionMessageWithSigners,
} from '../sign-transaction';
import { ITransactionMessageWithSingleSendingSigner } from '../transaction-with-single-sending-signer';

type CompilableTransactionMessageWithSigners = CompilableTransactionMessage & ITransactionMessageWithSigners;

{
    // [partiallySignTransactionMessageWithSigners]: returns a transaction with a blockhash lifetime
    const transactionMessage = null as unknown as CompilableTransactionMessageWithSigners &
        TransactionMessageWithBlockhashLifetime;
    partiallySignTransactionMessageWithSigners(transactionMessage) satisfies Promise<
        Readonly<Transaction & TransactionWithBlockhashLifetime>
    >;
}

{
    // [partiallySignTransactionMessageWithSigners]: returns a transaction with a durable nonce lifetime
    const transactionMessage = null as unknown as CompilableTransactionMessageWithSigners &
        TransactionMessageWithDurableNonceLifetime;
    partiallySignTransactionMessageWithSigners(transactionMessage) satisfies Promise<
        Readonly<Transaction & TransactionWithDurableNonceLifetime>
    >;
}

{
    // [partiallySignTransactionMessageWithSigners]: returns a transaction with an unknown lifetime
    const transactionMessage = null as unknown as CompilableTransactionMessageWithSigners;
    partiallySignTransactionMessageWithSigners(transactionMessage) satisfies Promise<
        Readonly<Transaction & TransactionWithLifetime>
    >;
}

{
    // [signTransactionMessageWithSigners]: returns a fully signed transaction with a blockhash lifetime
    const transactionMessage = null as unknown as CompilableTransactionMessageWithSigners &
        TransactionMessageWithBlockhashLifetime;
    signTransactionMessageWithSigners(transactionMessage) satisfies Promise<
        Readonly<FullySignedTransaction & TransactionWithBlockhashLifetime>
    >;
}

{
    // [signTransactionMessageWithSigners]: returns a fully signed transaction with a durable nonce lifetime
    const transactionMessage = null as unknown as CompilableTransactionMessageWithSigners &
        TransactionMessageWithDurableNonceLifetime;
    signTransactionMessageWithSigners(transactionMessage) satisfies Promise<
        Readonly<FullySignedTransaction & TransactionWithDurableNonceLifetime>
    >;
}

{
    // [signTransactionMessageWithSigners]: returns a fully signed transaction with an unknown lifetime
    const transactionMessage = null as unknown as CompilableTransactionMessageWithSigners;
    signTransactionMessageWithSigners(transactionMessage) satisfies Promise<
        Readonly<FullySignedTransaction & TransactionWithLifetime>
    >;
}

{
    // [signAndSendTransactionMessageWithSigners]: returns a signature
    const transactionMessage = null as unknown as CompilableTransactionMessageWithSigners &
        ITransactionMessageWithSingleSendingSigner;
    signAndSendTransactionMessageWithSigners(transactionMessage) satisfies Promise<SignatureBytes>;
}
