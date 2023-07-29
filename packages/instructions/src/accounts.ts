import { Base58EncodedAddress } from '@solana/addresses';

import { AccountRole } from './roles';

export interface IAccountMeta<TAddress extends string = string> {
    readonly address: Base58EncodedAddress<TAddress>;
    readonly role: AccountRole;
}

export type ReadonlyAccount<TAddress extends string = string> = IAccountMeta<TAddress> & {
    readonly role: AccountRole.READONLY;
};
export type WritableAccount<TAddress extends string = string> = IAccountMeta<TAddress> & { role: AccountRole.WRITABLE };
export type ReadonlySignerAccount<TAddress extends string = string> = IAccountMeta<TAddress> & {
    role: AccountRole.READONLY_SIGNER;
};
export type WritableSignerAccount<TAddress extends string = string> = IAccountMeta<TAddress> & {
    role: AccountRole.WRITABLE_SIGNER;
};

export interface IAccountLookupMeta<TAddress extends string = string, TLookupTableAddress extends string = string> {
    readonly address: Base58EncodedAddress<TAddress>;
    readonly addressIndex: number;
    readonly lookupTableAddress: Base58EncodedAddress<TLookupTableAddress>;
    readonly role: AccountRole.READONLY | AccountRole.WRITABLE;
}

export type ReadonlyAccountLookup<
    TAddress extends string = string,
    TLookupTableAddress extends string = string
> = IAccountLookupMeta<TAddress, TLookupTableAddress> & { readonly role: AccountRole.READONLY };
export type WritableAccountLookup<
    TAddress extends string = string,
    TLookupTableAddress extends string = string
> = IAccountLookupMeta<TAddress, TLookupTableAddress> & { readonly role: AccountRole.WRITABLE };
