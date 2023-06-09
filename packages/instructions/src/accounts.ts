import { Base58EncodedAddress } from '@solana/keys';

export interface IAccountMeta<TAddress extends string = string> {
    readonly address: Base58EncodedAddress<TAddress>;
    readonly isSigner: boolean;
    readonly isWritable: boolean;
}

export type ReadonlyAccount<TAddress extends string = string> = IAccountMeta<TAddress> &
    Readonly<{ isSigner: false; isWritable: false }>;
export type WritableAccount<TAddress extends string = string> = IAccountMeta<TAddress> &
    Readonly<{ isSigner: false; isWritable: true }>;
export type ReadonlySignerAccount<TAddress extends string = string> = IAccountMeta<TAddress> &
    Readonly<{ isSigner: true; isWritable: false }>;
export type WritableSignerAccount<TAddress extends string = string> = IAccountMeta<TAddress> &
    Readonly<{ isSigner: true; isWritable: true }>;

export interface IAccountLookupMeta<TAddress extends string = string, TLookupTableAddress extends string = string> {
    readonly address: Base58EncodedAddress<TAddress>;
    readonly addressIndex: number;
    readonly lookupTableAddress: Base58EncodedAddress<TLookupTableAddress>;
    readonly isWritable: boolean;
}

export type ReadonlyAccountLookup<
    TAddress extends string = string,
    TLookupTableAddress extends string = string
> = IAccountLookupMeta<TAddress, TLookupTableAddress> & Readonly<{ isWritable: false }>;
export type WritableAccountLookup<
    TAddress extends string = string,
    TLookupTableAddress extends string = string
> = IAccountLookupMeta<TAddress, TLookupTableAddress> & Readonly<{ isWritable: true }>;
