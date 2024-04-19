import { Blockhash } from '@solana/rpc-types';
import {
    BaseTransactionMessage,
    CompilableTransactionMessage,
    ITransactionMessageWithFeePayer,
    Nonce,
    TransactionMessageWithBlockhashLifetime,
    TransactionMessageWithDurableNonceLifetime,
} from '@solana/transaction-messages';

import { compileTransaction } from '../compile-transaction';
import {
    TransactionBlockhashLifetime,
    TransactionDurableNonceLifetime,
    TransactionWithBlockhashLifetime,
    TransactionWithDurableNonceLifetime,
    TransactionWithLifetime,
} from '../lifetime';
import { Transaction } from '../transaction';

// transaction message with blockhash lifetime
compileTransaction(
    null as unknown as BaseTransactionMessage &
        ITransactionMessageWithFeePayer &
        TransactionMessageWithBlockhashLifetime,
) satisfies Readonly<Transaction & TransactionWithLifetime>;
compileTransaction(
    null as unknown as BaseTransactionMessage &
        ITransactionMessageWithFeePayer &
        TransactionMessageWithBlockhashLifetime,
) satisfies Readonly<Transaction & TransactionWithBlockhashLifetime>;
compileTransaction(
    null as unknown as BaseTransactionMessage &
        ITransactionMessageWithFeePayer &
        TransactionMessageWithBlockhashLifetime,
).lifetimeConstraint.blockhash satisfies Blockhash;

// transaction message with durable nonce lifetime
compileTransaction(
    null as unknown as BaseTransactionMessage &
        ITransactionMessageWithFeePayer &
        TransactionMessageWithDurableNonceLifetime,
) satisfies Readonly<Transaction & TransactionWithLifetime>;
compileTransaction(
    null as unknown as BaseTransactionMessage &
        ITransactionMessageWithFeePayer &
        TransactionMessageWithDurableNonceLifetime,
) satisfies Readonly<Transaction & TransactionWithDurableNonceLifetime>;
compileTransaction(
    null as unknown as BaseTransactionMessage &
        ITransactionMessageWithFeePayer &
        TransactionMessageWithDurableNonceLifetime,
).lifetimeConstraint.nonce satisfies Nonce;

// transaction message with unknown lifetime
compileTransaction(null as unknown as CompilableTransactionMessage) satisfies Readonly<
    Transaction & TransactionWithLifetime
>;
// @ts-expect-error not known to have blockhash lifetime
compileTransaction(null as unknown as CompilableTransactionMessage) satisfies Readonly<
    Transaction & TransactionBlockhashLifetime
>;
// @ts-expect-error not known to have durable nonce lifetime
compileTransaction(null as unknown as CompilableTransactionMessage) satisfies Readonly<
    Transaction & TransactionDurableNonceLifetime
>;
compileTransaction(null as unknown as CompilableTransactionMessage).lifetimeConstraint satisfies
    | { blockhash: Blockhash }
    | { nonce: Nonce };
// @ts-expect-error not known to have blockhash lifetime
compileTransaction(null as unknown as CompilableTransactionMessage).lifetimeConstraint satisfies {
    blockhash: Blockhash;
};
// @ts-expect-error not known to have durable nonce lifetime
compileTransaction(null as unknown as CompilableTransactionMessage).lifetimeConstraint satisfies { nonce: Nonce };
