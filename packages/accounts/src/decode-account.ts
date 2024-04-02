import type { Decoder, ReadonlyUint8Array } from '@solana/codecs-core';
import {
    SOLANA_ERROR__ACCOUNTS__EXPECTED_ALL_ACCOUNTS_TO_BE_DECODED,
    SOLANA_ERROR__ACCOUNTS__EXPECTED_DECODED_ACCOUNT,
    SOLANA_ERROR__ACCOUNTS__FAILED_TO_DECODE_ACCOUNT,
    SolanaError,
} from '@solana/errors';

import type { Account, EncodedAccount } from './account';
import type { MaybeAccount, MaybeEncodedAccount } from './maybe-account';

/** Decodes the data of a given account using the provided decoder. */
export function decodeAccount<TData extends object, TAddress extends string = string>(
    encodedAccount: EncodedAccount<TAddress>,
    decoder: Decoder<TData>,
): Account<TData, TAddress>;
export function decodeAccount<TData extends object, TAddress extends string = string>(
    encodedAccount: MaybeEncodedAccount<TAddress>,
    decoder: Decoder<TData>,
): MaybeAccount<TData, TAddress>;
export function decodeAccount<TData extends object, TAddress extends string = string>(
    encodedAccount: EncodedAccount<TAddress> | MaybeEncodedAccount<TAddress>,
    decoder: Decoder<TData>,
): Account<TData, TAddress> | MaybeAccount<TData, TAddress> {
    try {
        if ('exists' in encodedAccount && !encodedAccount.exists) {
            return encodedAccount;
        }
        return Object.freeze({ ...encodedAccount, data: decoder.decode(encodedAccount.data) });
    } catch (e) {
        throw new SolanaError(SOLANA_ERROR__ACCOUNTS__FAILED_TO_DECODE_ACCOUNT, {
            address: encodedAccount.address,
        });
    }
}

function accountExists<TData extends object>(account: Account<TData> | MaybeAccount<TData>): account is Account<TData> {
    return !('exists' in account) || ('exists' in account && account.exists);
}

/** Asserts that an account has been decoded. */
export function assertAccountDecoded<TData extends object, TAddress extends string = string>(
    account: Account<TData | Uint8Array, TAddress>,
): asserts account is Account<TData, TAddress>;
export function assertAccountDecoded<TData extends object, TAddress extends string = string>(
    account: MaybeAccount<TData | Uint8Array, TAddress>,
): asserts account is MaybeAccount<TData, TAddress>;
export function assertAccountDecoded<TData extends object, TAddress extends string = string>(
    account: Account<TData | Uint8Array, TAddress> | MaybeAccount<TData | Uint8Array, TAddress>,
): asserts account is Account<TData, TAddress> | MaybeAccount<TData, TAddress> {
    if (accountExists(account) && account.data instanceof Uint8Array) {
        throw new SolanaError(SOLANA_ERROR__ACCOUNTS__EXPECTED_DECODED_ACCOUNT, {
            address: account.address,
        });
    }
}

/** Asserts that all accounts have been decoded. */
export function assertAccountsDecoded<TData extends object, TAddress extends string = string>(
    accounts: Account<ReadonlyUint8Array | TData, TAddress>[],
): asserts accounts is Account<TData, TAddress>[];
export function assertAccountsDecoded<TData extends object, TAddress extends string = string>(
    accounts: MaybeAccount<ReadonlyUint8Array | TData, TAddress>[],
): asserts accounts is MaybeAccount<TData, TAddress>[];
export function assertAccountsDecoded<TData extends object, TAddress extends string = string>(
    accounts: (Account<ReadonlyUint8Array | TData, TAddress> | MaybeAccount<ReadonlyUint8Array | TData, TAddress>)[],
): asserts accounts is (Account<TData, TAddress> | MaybeAccount<TData, TAddress>)[] {
    const encoded = accounts.filter(a => accountExists(a) && a.data instanceof Uint8Array);
    if (encoded.length > 0) {
        const encodedAddresses = encoded.map(a => a.address);
        throw new SolanaError(SOLANA_ERROR__ACCOUNTS__EXPECTED_ALL_ACCOUNTS_TO_BE_DECODED, {
            addresses: encodedAddresses,
        });
    }
}
