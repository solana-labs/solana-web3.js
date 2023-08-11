import { Base58EncodedAddress } from '@solana/addresses';

import {
    Base58EncodedBytes,
    Base58EncodedDataResponse,
    Base64EncodedDataResponse,
    Base64EncodedZStdCompressedDataResponse,
    Commitment,
    DataSlice,
    LamportsUnsafeBeyond2Pow53Minus1,
    RpcResponse,
    Slot,
    TokenAccount,
    U64UnsafeBeyond2Pow53Minus1,
} from './common';

type TokenAccountInfoBase = Readonly<{
    /** indicates if the account contains a program (and is strictly read-only) */
    executable: boolean;
    /** number of lamports assigned to this account */
    lamports: LamportsUnsafeBeyond2Pow53Minus1;
    /** pubkey of the program this account has been assigned to */
    owner: Base58EncodedAddress;
    /** the epoch at which this account will next owe rent */
    rentEpoch: U64UnsafeBeyond2Pow53Minus1;
    /** the data size of the account */
    space: U64UnsafeBeyond2Pow53Minus1;
}>;

type TokenAccountInfoWithDefaultData = Readonly<{
    data: Base58EncodedBytes;
}>;

type TokenAccountInfoWithBase58EncodedData_DEPRECATED = Readonly<{
    data: Base58EncodedDataResponse;
}>;

type TokenAccountInfoWithBase64EncodedData = Readonly<{
    data: Base64EncodedDataResponse;
}>;

type TokenAccountInfoWithBase64EncodedZStdCompressedData = Readonly<{
    data: Base64EncodedZStdCompressedDataResponse;
}>;

type TokenAccountInfoWithJsonData = Readonly<{
    data: Readonly<{
        /** Name of the program that owns this account. */
        program: {
            info: TokenAccount;
            type: 'account';
        };
        parsed: unknown;
        space: U64UnsafeBeyond2Pow53Minus1;
    }>;
}>;

type TokenAccountWithPubkey<TAccount extends TokenAccountInfoBase> = Readonly<{
    account: TAccount;
    pubkey: Base58EncodedAddress;
}>;

type MintFilter = Readonly<{
    /** Pubkey of the specific token Mint to limit accounts to */
    mint: Base58EncodedAddress;
}>;

type ProgramIdFilter = Readonly<{
    /** Pubkey of the Token program that owns the accounts */
    programId: Base58EncodedAddress;
}>;

type AccountsFilter = MintFilter | ProgramIdFilter;

type GetTokenAccountsByDelegateApiCommonConfig = Readonly<{
    /** @default "finalized" */
    commitment?: Commitment;
    /** The minimum slot that the request can be evaluated at */
    minContextSlot?: Slot;
}>;

type GetTokenAccountsByDelegateApiSliceableCommonConfig = Readonly<{
    /** Limit the returned account data */
    dataSlice?: DataSlice;
}>;
export interface GetTokenAccountsByDelegateApi {
    /**
     * Returns all SPL Token accounts by approved Delegate.
     */
    getTokenAccountsByDelegate(
        program: Base58EncodedAddress,
        filter: AccountsFilter,
        config: GetTokenAccountsByDelegateApiCommonConfig &
            GetTokenAccountsByDelegateApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base64';
            }>
    ): RpcResponse<TokenAccountWithPubkey<TokenAccountInfoBase & TokenAccountInfoWithBase64EncodedData>[]>;

    getTokenAccountsByDelegate(
        program: Base58EncodedAddress,
        filter: AccountsFilter,
        config: GetTokenAccountsByDelegateApiCommonConfig &
            GetTokenAccountsByDelegateApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base64+zstd';
            }>
    ): RpcResponse<
        TokenAccountWithPubkey<TokenAccountInfoBase & TokenAccountInfoWithBase64EncodedZStdCompressedData>[]
    >;

    getTokenAccountsByDelegate(
        program: Base58EncodedAddress,
        filter: AccountsFilter,
        config: GetTokenAccountsByDelegateApiCommonConfig &
            Readonly<{
                encoding: 'jsonParsed';
            }>
    ): RpcResponse<TokenAccountWithPubkey<TokenAccountInfoBase & TokenAccountInfoWithJsonData>[]>;

    getTokenAccountsByDelegate(
        program: Base58EncodedAddress,
        filter: AccountsFilter,
        config: GetTokenAccountsByDelegateApiCommonConfig &
            GetTokenAccountsByDelegateApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base58';
            }>
    ): RpcResponse<TokenAccountWithPubkey<TokenAccountInfoBase & TokenAccountInfoWithBase58EncodedData_DEPRECATED>[]>;

    getTokenAccountsByDelegate(
        program: Base58EncodedAddress,
        filter: AccountsFilter,
        config?: GetTokenAccountsByDelegateApiCommonConfig & GetTokenAccountsByDelegateApiSliceableCommonConfig
    ): RpcResponse<TokenAccountWithPubkey<TokenAccountInfoBase & TokenAccountInfoWithDefaultData>[]>;
}
