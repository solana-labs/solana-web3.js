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
    U64UnsafeBeyond2Pow53Minus1,
} from './common';

type AccountInfoBase = Readonly<{
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

type AccountInfoWithDefaultData = Readonly<{
    data: Base58EncodedBytes;
}>;

type AccountInfoWithBase58EncodedData_DEPRECATED = Readonly<{
    data: Base58EncodedDataResponse;
}>;

type AccountInfoWithBase64EncodedData = Readonly<{
    data: Base64EncodedDataResponse;
}>;

type AccountInfoWithBase64EncodedZStdCompressedData = Readonly<{
    data: Base64EncodedZStdCompressedDataResponse;
}>;

type AccountInfoWithJsonData = Readonly<{
    data:
        | Readonly<{
              /** Name of the program that owns this account. */
              program: string;
              parsed: unknown;
              space: U64UnsafeBeyond2Pow53Minus1;
          }>
        // If `jsonParsed` encoding is requested but a parser cannot be found for the given
        // account the `data` field falls back to `base64`.
        | Base64EncodedDataResponse;
}>;

type AccountWithPubkey<TAccount extends AccountInfoBase> = Readonly<{
    account: TAccount;
    pubkey: Base58EncodedAddress;
}>;

type GetProgramAccountsMemcmpFilter = Readonly<{
    offset: U64UnsafeBeyond2Pow53Minus1;
    bytes: string;
    encoding: 'base58' | 'base64';
}>;

type GetProgramAccountsDatasizeFilter = Readonly<{
    dataSize: U64UnsafeBeyond2Pow53Minus1;
}>;

type GetProgramAccountsApiCommonConfig = Readonly<{
    /** @default "finalized" */
    commitment?: Commitment;
    /** The minimum slot that the request can be evaluated at */
    minContextSlot?: Slot;
    /** filter results (up to 4 filters allowed) @see https://docs.solana.com/api/http#filter-criteria */
    filters?: (GetProgramAccountsMemcmpFilter | GetProgramAccountsDatasizeFilter)[];
}>;

type GetProgramAccountsApiSliceableCommonConfig = Readonly<{
    /** Limit the returned account data */
    dataSlice?: DataSlice;
}>;
export interface GetProgramAccountsApi {
    /**
     * Returns the account information for a list of Pubkeys.
     */
    getProgramAccounts(
        program: Base58EncodedAddress,
        config: GetProgramAccountsApiCommonConfig &
            GetProgramAccountsApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base64';
                withContext: true;
            }>
    ): RpcResponse<AccountWithPubkey<AccountInfoBase & AccountInfoWithBase64EncodedData>[]>;

    getProgramAccounts(
        program: Base58EncodedAddress,
        config: GetProgramAccountsApiCommonConfig &
            GetProgramAccountsApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base64';
                withContext?: boolean;
            }>
    ): AccountWithPubkey<AccountInfoBase & AccountInfoWithBase64EncodedData>[];

    getProgramAccounts(
        program: Base58EncodedAddress,
        config: GetProgramAccountsApiCommonConfig &
            GetProgramAccountsApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base64+zstd';
                withContext: true;
            }>
    ): RpcResponse<AccountWithPubkey<AccountInfoBase & AccountInfoWithBase64EncodedZStdCompressedData>[]>;

    getProgramAccounts(
        program: Base58EncodedAddress,
        config: GetProgramAccountsApiCommonConfig &
            GetProgramAccountsApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base64+zstd';
                withContext?: boolean;
            }>
    ): AccountWithPubkey<AccountInfoBase & AccountInfoWithBase64EncodedZStdCompressedData>[];

    getProgramAccounts(
        program: Base58EncodedAddress,
        config: GetProgramAccountsApiCommonConfig &
            Readonly<{
                encoding: 'jsonParsed';
                withContext: true;
            }>
    ): RpcResponse<AccountWithPubkey<AccountInfoBase & AccountInfoWithJsonData>[]>;

    getProgramAccounts(
        program: Base58EncodedAddress,
        config: GetProgramAccountsApiCommonConfig &
            Readonly<{
                encoding: 'jsonParsed';
                withContext?: boolean;
            }>
    ): AccountWithPubkey<AccountInfoBase & AccountInfoWithJsonData>[];

    getProgramAccounts(
        program: Base58EncodedAddress,
        config: GetProgramAccountsApiCommonConfig &
            GetProgramAccountsApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base58';
                withContext: true;
            }>
    ): RpcResponse<AccountWithPubkey<AccountInfoBase & AccountInfoWithBase58EncodedData_DEPRECATED>[]>;

    getProgramAccounts(
        program: Base58EncodedAddress,
        config: GetProgramAccountsApiCommonConfig &
            GetProgramAccountsApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base58';
                withContext?: boolean;
            }>
    ): AccountWithPubkey<AccountInfoBase & AccountInfoWithBase58EncodedData_DEPRECATED>[];

    getProgramAccounts(
        program: Base58EncodedAddress,
        config: GetProgramAccountsApiCommonConfig &
            GetProgramAccountsApiSliceableCommonConfig &
            Readonly<{
                withContext: true;
            }>
    ): RpcResponse<AccountWithPubkey<AccountInfoBase & AccountInfoWithDefaultData>[]>;

    getProgramAccounts(
        program: Base58EncodedAddress,
        config?: GetProgramAccountsApiCommonConfig &
            GetProgramAccountsApiSliceableCommonConfig &
            Readonly<{
                withContext?: boolean;
            }>
    ): AccountWithPubkey<AccountInfoBase & AccountInfoWithDefaultData>[];
}
