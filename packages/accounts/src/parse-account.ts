import type { Address } from '@solana/addresses';
import { getBase58Encoder, getBase64Encoder } from '@solana/codecs-strings';
import type {
    AccountInfoBase,
    AccountInfoWithBase58Bytes,
    AccountInfoWithBase58EncodedData,
    AccountInfoWithBase64EncodedData,
} from '@solana/rpc-types';

import type { Account, BaseAccount, EncodedAccount } from './account';
import type { MaybeAccount, MaybeEncodedAccount } from './maybe-account';
import type { JsonParsedDataResponse } from './rpc-api';

type Base64EncodedRpcAccount = AccountInfoBase & AccountInfoWithBase64EncodedData;

/** Parse an account object received from a base64-encoded RPC call into an EncodedAccount or MaybeEncodedAccount type. */
export function parseBase64RpcAccount<TAddress extends string = string>(
    address: Address<TAddress>,
    rpcAccount: Base64EncodedRpcAccount,
): EncodedAccount<TAddress>;
export function parseBase64RpcAccount<TAddress extends string = string>(
    address: Address<TAddress>,
    rpcAccount: Base64EncodedRpcAccount | null,
): MaybeEncodedAccount<TAddress>;
export function parseBase64RpcAccount<TAddress extends string = string>(
    address: Address<TAddress>,
    rpcAccount: Base64EncodedRpcAccount | null,
): EncodedAccount<TAddress> | MaybeEncodedAccount<TAddress> {
    if (!rpcAccount) return Object.freeze({ address, exists: false });
    const data = getBase64Encoder().encode(rpcAccount.data[0]);
    return Object.freeze({ ...parseBaseAccount(rpcAccount), address, data, exists: true });
}

type Base58EncodedRpcAccount = AccountInfoBase & (AccountInfoWithBase58Bytes | AccountInfoWithBase58EncodedData);

/** Parse an account object received from a base58-encoded RPC call into an EncodedAccount or MaybeEncodedAccount type. */
export function parseBase58RpcAccount<TAddress extends string = string>(
    address: Address<TAddress>,
    rpcAccount: Base58EncodedRpcAccount,
): EncodedAccount<TAddress>;
export function parseBase58RpcAccount<TAddress extends string = string>(
    address: Address<TAddress>,
    rpcAccount: Base58EncodedRpcAccount | null,
): MaybeEncodedAccount<TAddress>;
export function parseBase58RpcAccount<TAddress extends string = string>(
    address: Address<TAddress>,
    rpcAccount: Base58EncodedRpcAccount | null,
): EncodedAccount<TAddress> | MaybeEncodedAccount<TAddress> {
    if (!rpcAccount) return Object.freeze({ address, exists: false });
    const data = getBase58Encoder().encode(typeof rpcAccount.data === 'string' ? rpcAccount.data : rpcAccount.data[0]);
    return Object.freeze({ ...parseBaseAccount(rpcAccount), address, data, exists: true });
}

type JsonParsedRpcAccount = AccountInfoBase & { readonly data: JsonParsedDataResponse<unknown> };

/** Parse an account object received from a json-parsed RPC call into an Account or MaybeAccount type. */
export function parseJsonRpcAccount<TData extends object, TAddress extends string = string>(
    address: Address<TAddress>,
    rpcAccount: JsonParsedRpcAccount,
): Account<TData, TAddress>;
export function parseJsonRpcAccount<TData extends object, TAddress extends string = string>(
    address: Address<TAddress>,
    rpcAccount: JsonParsedRpcAccount | null,
): MaybeAccount<TData, TAddress>;
export function parseJsonRpcAccount<TData extends object, TAddress extends string = string>(
    address: Address<TAddress>,
    rpcAccount: JsonParsedRpcAccount | null,
): Account<TData, TAddress> | MaybeAccount<TData, TAddress> {
    if (!rpcAccount) return Object.freeze({ address, exists: false });
    const data = rpcAccount.data.parsed.info as TData;
    return Object.freeze({ ...parseBaseAccount(rpcAccount), address, data, exists: true });
}

function parseBaseAccount(rpcAccount: AccountInfoBase): BaseAccount {
    return Object.freeze({
        executable: rpcAccount.executable,
        lamports: rpcAccount.lamports,
        programAddress: rpcAccount.owner,
    });
}
