import { Address } from '@solana/addresses';

import { MessagePartialSigner } from './message-partial-signer.js';
import { TransactionPartialSigner } from './transaction-partial-signer.js';

/** Defines a no-operation signer that pretends to partially sign messages and transactions. */
export type NoopSigner<TAddress extends string = string> = MessagePartialSigner<TAddress> &
    TransactionPartialSigner<TAddress>;

/** Creates a NoopSigner from the provided Address. */
export function createNoopSigner(address: Address): NoopSigner {
    const out: NoopSigner = {
        address,
        signMessages: async messages => messages.map(() => Object.freeze({})),
        signTransactions: async transactions => transactions.map(() => Object.freeze({})),
    };

    return Object.freeze(out);
}
