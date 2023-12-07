import type { Decoder } from '@solana/codecs-core';

import type { Account, EncodedAccount } from './account';
import type { MaybeAccount, MaybeEncodedAccount } from './maybe-account';

/** Decodes the data of a given account using the provided decoder. */
export function decodeAccount<TData extends object, TAddress extends string = string>(
    encodedAccount: EncodedAccount<TAddress>,
    decoder: Decoder<TData>
): Account<TData, TAddress>;
export function decodeAccount<TData extends object, TAddress extends string = string>(
    encodedAccount: MaybeEncodedAccount<TAddress>,
    decoder: Decoder<TData>
): MaybeAccount<TData, TAddress>;
export function decodeAccount<TData extends object, TAddress extends string = string>(
    encodedAccount: EncodedAccount<TAddress> | MaybeEncodedAccount<TAddress>,
    decoder: Decoder<TData>
): Account<TData, TAddress> | MaybeAccount<TData, TAddress> {
    try {
        if ('exists' in encodedAccount && !encodedAccount.exists) {
            return encodedAccount;
        }
        return Object.freeze({ ...encodedAccount, data: decoder.decode(encodedAccount.data) });
    } catch (error) {
        // TODO: Coded error.
        const newError = new Error(`Failed to decode account [${encodedAccount.address}].`);
        newError.cause = error;
        throw newError;
    }
}
