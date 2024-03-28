import type { Address } from '@solana/addresses';
import { ReadonlyUint8Array } from '@solana/codecs-core';
import type { LamportsUnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';

/** The amount of bytes required to store the base account information without its data. */
export const BASE_ACCOUNT_SIZE = 128;

/** Describe the generic account details applicable to every account. */
export type BaseAccount = {
    readonly executable: boolean;
    readonly lamports: LamportsUnsafeBeyond2Pow53Minus1;
    readonly programAddress: Address;
};

/** Defines a Solana account with its generic details and parsed or encoded data. */
export type Account<TData extends Uint8Array | object, TAddress extends string = string> = BaseAccount & {
    readonly address: Address<TAddress>;
    readonly data: TData;
};

/** Defines a Solana account with its generic details and encoded data. */
export type EncodedAccount<TAddress extends string = string> = Account<ReadonlyUint8Array, TAddress>;
