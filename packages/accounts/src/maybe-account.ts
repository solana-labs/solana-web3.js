import { Address } from '@solana/addresses';
import {
    SOLANA_ERROR__ACCOUNTS__ACCOUNT_NOT_FOUND,
    SOLANA_ERROR__ACCOUNTS__ONE_OR_MORE_ACCOUNTS_NOT_FOUND,
    SolanaError,
} from '@solana/errors';

import { Account } from './account';

/** Defines a Solana account that may or may not exist after having tried to fetch it. */
export type MaybeAccount<TData extends Uint8Array | object, TAddress extends string = string> =
    | { readonly address: Address<TAddress>; readonly exists: false }
    | (Account<TData, TAddress> & { readonly exists: true });

/** Defines a Solana account with encoded data that may or may not exist after having tried to fetch it. */
export type MaybeEncodedAccount<TAddress extends string = string> = MaybeAccount<Uint8Array, TAddress>;

/** Asserts that an account that may or may not exists, actually exists. */
export function assertAccountExists<TData extends Uint8Array | object, TAddress extends string = string>(
    account: MaybeAccount<TData, TAddress>,
): asserts account is Account<TData, TAddress> & { exists: true } {
    if (!account.exists) {
        throw new SolanaError(SOLANA_ERROR__ACCOUNTS__ACCOUNT_NOT_FOUND, { address: account.address });
    }
}

/** Asserts that all accounts that may or may not exist, actually all exist. */
export function assertAccountsExist<TData extends Uint8Array | object, TAddress extends string = string>(
    accounts: MaybeAccount<TData, TAddress>[],
): asserts accounts is (Account<TData, TAddress> & { exists: true })[] {
    const missingAccounts = accounts.filter(a => !a.exists);
    if (missingAccounts.length > 0) {
        const missingAddresses = missingAccounts.map(a => a.address);
        throw new SolanaError(SOLANA_ERROR__ACCOUNTS__ONE_OR_MORE_ACCOUNTS_NOT_FOUND, { addresses: missingAddresses });
    }
}
