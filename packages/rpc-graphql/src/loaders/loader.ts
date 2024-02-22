import type { Address } from '@solana/addresses';
import type { Signature } from '@solana/keys';
import type { GetAccountInfoApi, GetBlockApi, GetProgramAccountsApi, GetTransactionApi } from '@solana/rpc';
import type { Commitment, Slot } from '@solana/rpc-types';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import stringify from 'json-stable-stringify';

export type BatchLoadPromiseCallback<T> = Readonly<{
    resolve: (value: T) => void;
    reject: (reason?: unknown) => void;
}>;

// Loader base types
export type LoadFn<TArgs, T> = (args: TArgs) => Promise<T>;
export type LoadManyFn<TArgs, T> = (args: TArgs[]) => Promise<(T | Error)[]>;
export type Loader<TArgs, T> = { load: LoadFn<TArgs, T>; loadMany: LoadManyFn<TArgs, T> };

export type AccountLoaderArgsBase = {
    commitment?: Commitment;
    dataSlice?: { offset: number; length: number };
    encoding?: 'base58' | 'base64' | 'base64+zstd' | 'jsonParsed';
    minContextSlot?: Slot;
};
export type AccountLoaderArgs = { address: Address } & AccountLoaderArgsBase;
export type AccountLoaderValue = ReturnType<GetAccountInfoApi['getAccountInfo']>['value'] | null;
export type AccountLoader = Loader<AccountLoaderArgs, AccountLoaderValue>;

export type BlockLoaderArgsBase = {
    commitment?: Omit<Commitment, 'processed'>;
    encoding?: 'base58' | 'base64' | 'json' | 'jsonParsed';
    maxSupportedTransactionVersion?: 0 | 'legacy';
    rewards?: boolean;
    transactionDetails?: 'accounts' | 'full' | 'none' | 'signatures';
};
export type BlockLoaderArgs = { slot: Slot } & BlockLoaderArgsBase;
export type BlockLoaderValue = ReturnType<GetBlockApi['getBlock']> | null;
export type BlockLoader = Loader<BlockLoaderArgs, BlockLoaderValue>;

export type MultipleAccountsLoaderArgs = { addresses: Address[] } & AccountLoaderArgsBase;
export type MultipleAccountsLoaderValue = AccountLoaderValue[];
export type MultipleAccountsLoader = Loader<MultipleAccountsLoaderArgs, MultipleAccountsLoaderValue>;

export type ProgramAccountsLoaderArgsBase = {
    commitment?: Commitment;
    dataSlice?: { offset: number; length: number };
    encoding?: 'base58' | 'base64' | 'base64+zstd' | 'jsonParsed';
    filters?: readonly { memcmp: { offset: number; bytes: string } }[];
    minContextSlot?: Slot;
};
export type ProgramAccountsLoaderArgs = { programAddress: Address } & ProgramAccountsLoaderArgsBase;
export type ProgramAccountsLoaderValue = ReturnType<GetProgramAccountsApi['getProgramAccounts']>;
export type ProgramAccountsLoader = Loader<ProgramAccountsLoaderArgs, ProgramAccountsLoaderValue>;

export type TransactionLoaderArgsBase = {
    commitment?: Omit<Commitment, 'processed'>;
    encoding?: 'base58' | 'base64' | 'json' | 'jsonParsed';
};
export type TransactionLoaderArgs = { signature: Signature } & TransactionLoaderArgsBase;
export type TransactionLoaderValue = ReturnType<GetTransactionApi['getTransaction']> | null;
export type TransactionLoader = Loader<TransactionLoaderArgs, TransactionLoaderValue>;

export type RpcGraphQLLoaders = {
    account: AccountLoader;
    block: BlockLoader;
    programAccounts: ProgramAccountsLoader;
    transaction: TransactionLoader;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function replacer(_: any, value: any) {
    if (typeof value === 'bigint') {
        return value.toString() + 'n';
    }
    return value;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const cacheKeyFn = (obj: any) => stringify(obj, { replacer });
