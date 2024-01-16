import type { Address } from '@solana/addresses';
import type { StringifiedBigInt, TokenAmount } from '@solana/rpc-types';

import { RpcParsedType } from './rpc-parsed-type';

type TokenAccountState = 'initialized' | 'uninitialized' | 'frozen';

export type JsonParsedTokenAccount = Readonly<{
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

type JsonParsedMintAccount = Readonly<{
    mintAuthority: Address | null;
    supply: StringifiedBigInt;
    decimals: number;
    isInitialized: boolean;
    freezeAuthority: Address | null;
    extensions?: readonly unknown[];
}>;

type JsonParsedMultisigAccount = Readonly<{
    numRequiredSigners: number;
    numValidSigners: number;
    isInitialized: boolean;
    signers: readonly Address[];
}>;

export type JsonParsedTokenProgramAccount =
    | RpcParsedType<'account', JsonParsedTokenAccount>
    | RpcParsedType<'mint', JsonParsedMintAccount>
    | RpcParsedType<'multisig', JsonParsedMultisigAccount>;
