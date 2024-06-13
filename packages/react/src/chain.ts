import { IdentifierArray } from '@wallet-standard/base';

type AssertSolanaChain<T> = T extends `solana:${string}` ? T : never;

export type OnlySolanaChains<T extends IdentifierArray> = T extends IdentifierArray
    ? AssertSolanaChain<T[number]>
    : never;
