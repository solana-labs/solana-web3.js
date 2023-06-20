import { Blockhash } from '@solana/rpc-core';

type BlockhashLifetimeConstraint = Readonly<{
    blockhash: Blockhash;
    lastValidBlockHeight: bigint;
}>;

export interface ITransactionWithBlockhashLifetime {
    readonly lifetimeConstraint: BlockhashLifetimeConstraint;
}
