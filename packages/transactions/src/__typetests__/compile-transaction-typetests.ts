import { Blockhash } from '@solana/rpc-types';
import {
    BaseTransactionMessage,
    CompilableTransactionMessage,
    IDurableNonceTransactionMessage,
    ITransactionMessageWithBlockhashLifetime,
    ITransactionMessageWithFeePayer,
    NewNonce,
} from '@solana/transaction-messages';

import { compileTransaction } from '../compile-transaction';
import {
    TransactionBlockhashLifetime,
    TransactionDurableNonceLifetime,
    TransactionWithBlockhashLifetime,
    TransactionWithDurableNonceLifetime,
    TransactionWithLifetime,
} from '../lifetime';
import { NewTransaction } from '../transaction';

// transaction message with blockhash lifetime
compileTransaction(
    null as unknown as BaseTransactionMessage &
        ITransactionMessageWithBlockhashLifetime &
        ITransactionMessageWithFeePayer,
) satisfies Readonly<NewTransaction & TransactionWithLifetime>;
compileTransaction(
    null as unknown as BaseTransactionMessage &
        ITransactionMessageWithBlockhashLifetime &
        ITransactionMessageWithFeePayer,
) satisfies Readonly<NewTransaction & TransactionWithBlockhashLifetime>;
compileTransaction(
    null as unknown as BaseTransactionMessage &
        ITransactionMessageWithBlockhashLifetime &
        ITransactionMessageWithFeePayer,
).lifetimeConstraint.blockhash satisfies Blockhash;

// transaction message with durable nonce lifetime
compileTransaction(
    null as unknown as BaseTransactionMessage & IDurableNonceTransactionMessage & ITransactionMessageWithFeePayer,
) satisfies Readonly<NewTransaction & TransactionWithLifetime>;
compileTransaction(
    null as unknown as BaseTransactionMessage & IDurableNonceTransactionMessage & ITransactionMessageWithFeePayer,
) satisfies Readonly<NewTransaction & TransactionWithDurableNonceLifetime>;
compileTransaction(
    null as unknown as BaseTransactionMessage & IDurableNonceTransactionMessage & ITransactionMessageWithFeePayer,
).lifetimeConstraint.nonce satisfies NewNonce;

// transaction message with unknown lifetime
compileTransaction(null as unknown as CompilableTransactionMessage) satisfies Readonly<
    NewTransaction & TransactionWithLifetime
>;
// @ts-expect-error not known to have blockhash lifetime
compileTransaction(null as unknown as CompilableTransactionMessage) satisfies Readonly<
    NewTransaction & TransactionBlockhashLifetime
>;
// @ts-expect-error not known to have durable nonce lifetime
compileTransaction(null as unknown as CompilableTransactionMessage) satisfies Readonly<
    NewTransaction & TransactionDurableNonceLifetime
>;
compileTransaction(null as unknown as CompilableTransactionMessage).lifetimeConstraint satisfies
    | { blockhash: Blockhash }
    | { nonce: NewNonce };
// @ts-expect-error not known to have blockhash lifetime
compileTransaction(null as unknown as CompilableTransactionMessage).lifetimeConstraint satisfies {
    blockhash: Blockhash;
};
// @ts-expect-error not known to have durable nonce lifetime
compileTransaction(null as unknown as CompilableTransactionMessage).lifetimeConstraint satisfies { nonce: NewNonce };
