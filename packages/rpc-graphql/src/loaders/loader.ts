import type { Address } from '@solana/addresses';
import type { Signature } from '@solana/keys';
import type { GetAccountInfoApi, GetBlockApi, GetProgramAccountsApi, GetTransactionApi } from '@solana/rpc';
import type { Commitment, Slot } from '@solana/rpc-types';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import stringify from 'json-stable-stringify';

export type LoadFn<TArgs, T> = (args: TArgs) => Promise<T>;
export type LoadManyFn<TArgs, T> = (args: TArgs[]) => Promise<(T | Error)[]>;
export type Loader<TArgs, T> = { load: LoadFn<TArgs, T>; loadMany: LoadManyFn<TArgs, T> };

// FIX ME: https://github.com/microsoft/TypeScript/issues/43187
// export type AccountLoaderArgs = { address: Parameters<GetAccountInfoApi['getAccountInfo']>[0] } & Parameters<
//     GetAccountInfoApi['getAccountInfo']
// >[1];
export type AccountLoaderArgs = {
    address: Address;
    commitment?: Commitment;
    dataSlice?: { offset: number; length: number };
    encoding?: 'base58' | 'base64' | 'base64+zstd' | 'jsonParsed';
    minContextSlot?: Slot;
};
export type AccountLoaderValue = ReturnType<GetAccountInfoApi['getAccountInfo']>['value'] | null;
export type AccountLoader = Loader<AccountLoaderArgs, AccountLoaderValue>;

// FIX ME: https://github.com/microsoft/TypeScript/issues/43187
// export type BlockLoaderArgs = { slot: Parameters<GetBlockApi['getBlock']>[0] } & Parameters<GetBlockApi['getBlock']>[1];
export type BlockLoaderArgs = {
    commitment?: Omit<Commitment, 'processed'>;
    encoding?: 'base58' | 'base64' | 'json' | 'jsonParsed';
    maxSupportedTransactionVersion?: 0 | 'legacy';
    rewards?: boolean;
    slot: Slot;
    transactionDetails?: 'accounts' | 'full' | 'none' | 'signatures';
};
export type BlockLoaderValue = ReturnType<GetBlockApi['getBlock']> | null;
export type BlockLoader = Loader<BlockLoaderArgs, BlockLoaderValue>;

// FIX ME: https://github.com/microsoft/TypeScript/issues/43187
// export type ProgramAccountsLoaderArgs = {
//     programAddress: Parameters<GetProgramAccountsApi['getProgramAccounts']>[0];
// } & Parameters<GetProgramAccountsApi['getProgramAccounts']>[1];
export type ProgramAccountsLoaderArgs = {
    commitment?: Commitment;
    dataSlice?: { offset: number; length: number };
    encoding?: 'base58' | 'base64' | 'base64+zstd' | 'jsonParsed';
    filters?: readonly { memcmp: { offset: number; bytes: string } }[];
    minContextSlot?: Slot;
    programAddress: Address;
};
export type ProgramAccountsLoaderValue = ReturnType<GetProgramAccountsApi['getProgramAccounts']> | null;
export type ProgramAccountsLoader = Loader<ProgramAccountsLoaderArgs, ProgramAccountsLoaderValue>;

// FIX ME: https://github.com/microsoft/TypeScript/issues/43187
// export type TransactionLoaderArgs = { signature: Parameters<GetTransactionApi['getTransaction']>[0] } & Parameters<
//     GetTransactionApi['getTransaction']
// >[1];
export type TransactionLoaderArgs = {
    commitment?: Commitment;
    encoding?: 'base58' | 'base64' | 'json' | 'jsonParsed';
    signature: Signature;
};
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
