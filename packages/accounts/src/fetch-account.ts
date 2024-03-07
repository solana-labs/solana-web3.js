import type { Address } from '@solana/addresses';
import type { Rpc } from '@solana/rpc-spec';
import type { Commitment, Slot } from '@solana/rpc-types';

import type { MaybeAccount, MaybeEncodedAccount } from './maybe-account';
import { parseBase64RpcAccount, parseJsonRpcAccount } from './parse-account';
import type { GetAccountInfoApi, GetMultipleAccountsApi } from './rpc-api';

/** Optional configuration for fetching a singular account. */
export type FetchAccountConfig = {
    abortSignal?: AbortSignal;
    commitment?: Commitment;
    minContextSlot?: Slot;
};

/** Fetch a base64-encoded account that may or may not exist using an RPC client. */
export async function fetchEncodedAccount<TAddress extends string = string>(
    rpc: Rpc<GetAccountInfoApi>,
    address: Address<TAddress>,
    config: FetchAccountConfig = {},
): Promise<MaybeEncodedAccount<TAddress>> {
    const { abortSignal, ...rpcConfig } = config;
    const response = await rpc.getAccountInfo(address, { ...rpcConfig, encoding: 'base64' }).send({ abortSignal });
    return parseBase64RpcAccount(address, response.value);
}

/** Fetch a json-parsed account that may or may not exist using an RPC client. */
export async function fetchJsonParsedAccount<TData extends object, TAddress extends string = string>(
    rpc: Rpc<GetAccountInfoApi>,
    address: Address<TAddress>,
    config: FetchAccountConfig = {},
): Promise<MaybeAccount<TData, TAddress> | MaybeEncodedAccount<TAddress>> {
    const { abortSignal, ...rpcConfig } = config;
    const { value: account } = await rpc
        .getAccountInfo(address, { ...rpcConfig, encoding: 'jsonParsed' })
        .send({ abortSignal });
    return !!account && typeof account === 'object' && 'parsed' in account.data
        ? parseJsonRpcAccount<TData, TAddress>(address, account as Parameters<typeof parseJsonRpcAccount>[1])
        : parseBase64RpcAccount<TAddress>(address, account as Parameters<typeof parseBase64RpcAccount>[1]);
}

/** Optional configuration for fetching multiple accounts. */
export type FetchAccountsConfig = {
    abortSignal?: AbortSignal;
    commitment?: Commitment;
    minContextSlot?: Slot;
};

/** Fetch multiple base64-encoded accounts that may or may not exist using an RPC client. */
export async function fetchEncodedAccounts<
    TAddresses extends string[] = string[],
    TWrappedAddresses extends { [P in keyof TAddresses]: Address<TAddresses[P]> } = {
        [P in keyof TAddresses]: Address<TAddresses[P]>;
    },
>(rpc: Rpc<GetMultipleAccountsApi>, addresses: TWrappedAddresses, config: FetchAccountsConfig = {}) {
    const { abortSignal, ...rpcConfig } = config;
    const response = await rpc
        .getMultipleAccounts(addresses, { ...rpcConfig, encoding: 'base64' })
        .send({ abortSignal });
    return response.value.map((account, index) => parseBase64RpcAccount(addresses[index], account)) as {
        [P in keyof TAddresses]: MaybeEncodedAccount<TAddresses[P]>;
    };
}

/** Fetch multiple json-parsed accounts that may or may not exist using an RPC client. */
export async function fetchJsonParsedAccounts<
    TData extends object[],
    TAddresses extends string[] = string[],
    TWrappedAddresses extends { [P in keyof TAddresses]: Address<TAddresses[P]> } = {
        [P in keyof TAddresses]: Address<TAddresses[P]>;
    },
>(rpc: Rpc<GetMultipleAccountsApi>, addresses: TWrappedAddresses, config: FetchAccountsConfig = {}) {
    const { abortSignal, ...rpcConfig } = config;
    const response = await rpc
        .getMultipleAccounts(addresses, { ...rpcConfig, encoding: 'jsonParsed' })
        .send({ abortSignal });
    return response.value.map((account, index) => {
        return !!account && typeof account === 'object' && 'parsed' in account.data
            ? parseJsonRpcAccount(addresses[index], account as Parameters<typeof parseJsonRpcAccount>[1])
            : parseBase64RpcAccount(addresses[index], account as Parameters<typeof parseBase64RpcAccount>[1]);
    }) as {
        [P in keyof TAddresses]:
            | MaybeAccount<TData[P & keyof TData], TAddresses[P]>
            | MaybeEncodedAccount<TAddresses[P]>;
    } & {
        [P in keyof TData]:
            | MaybeAccount<TData[P], TAddresses[P & keyof TAddresses]>
            | MaybeEncodedAccount<TAddresses[P & keyof TAddresses]>;
    };
}
