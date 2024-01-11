import type { Address } from '@solana/addresses';
import type { StringifiedBigInt, TokenAmount } from '@solana/rpc-types';

import { RpcParsedType } from './rpc-parsed-type';

type TokenAccountState = 'initialized' | 'uninitialized' | 'frozen';

export type TokenAccount = Readonly<{
    mint: Address;
    owner: Address;
    tokenAmount: TokenAmount;
    delegate?: Address;
    state: TokenAccountState;
    isNative: boolean;
    rentExemptReserve?: TokenAmount;
    delegatedAmount?: TokenAmount;
    closeAuthority?: Address;
    extensions?: readonly unknown[];
}>;

export type MintAccount = Readonly<{
    mintAuthority: Address | null;
    supply: StringifiedBigInt;
    decimals: number;
    isInitialized: boolean;
    freezeAuthority: Address | null;
    extensions?: readonly unknown[];
}>;

export type MultisigAccount = Readonly<{
    numRequiredSigners: number;
    numValidSigners: number;
    isInitialized: boolean;
    signers: readonly Address[];
}>;

export type TokenProgramAccount =
    | RpcParsedType<'account', TokenAccount>
    | RpcParsedType<'mint', MintAccount>
    | RpcParsedType<'multisig', MultisigAccount>;
