import { Address } from '@solana/addresses';
import { Commitment } from '@solana/rpc-types';

import {
    AccountInfoBase,
    AccountInfoWithBase58Bytes,
    AccountInfoWithBase58EncodedData,
    AccountInfoWithBase64EncodedData,
    AccountInfoWithBase64EncodedZStdCompressedData,
    AccountInfoWithJsonData,
    AccountInfoWithPubkey,
    DataSlice,
    GetProgramAccountsDatasizeFilter,
    GetProgramAccountsMemcmpFilter,
    RpcResponse,
    Slot,
} from './common';

type GetProgramAccountsApiCommonConfig = Readonly<{
    /** @defaultValue "finalized" */
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
        program: Address,
        config: GetProgramAccountsApiCommonConfig &
            GetProgramAccountsApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base64';
                withContext: true;
            }>
    ): RpcResponse<AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase64EncodedData>[]>;

    getProgramAccounts(
        program: Address,
        config: GetProgramAccountsApiCommonConfig &
            GetProgramAccountsApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base64';
                withContext?: boolean;
            }>
    ): AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase64EncodedData>[];

    getProgramAccounts(
        program: Address,
        config: GetProgramAccountsApiCommonConfig &
            GetProgramAccountsApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base64+zstd';
                withContext: true;
            }>
    ): RpcResponse<AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase64EncodedZStdCompressedData>[]>;

    getProgramAccounts(
        program: Address,
        config: GetProgramAccountsApiCommonConfig &
            GetProgramAccountsApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base64+zstd';
                withContext?: boolean;
            }>
    ): AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase64EncodedZStdCompressedData>[];

    getProgramAccounts(
        program: Address,
        config: GetProgramAccountsApiCommonConfig &
            Readonly<{
                encoding: 'jsonParsed';
                withContext: true;
            }>
    ): RpcResponse<AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithJsonData>[]>;

    getProgramAccounts(
        program: Address,
        config: GetProgramAccountsApiCommonConfig &
            Readonly<{
                encoding: 'jsonParsed';
                withContext?: boolean;
            }>
    ): AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithJsonData>[];

    getProgramAccounts(
        program: Address,
        config: GetProgramAccountsApiCommonConfig &
            GetProgramAccountsApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base58';
                withContext: true;
            }>
    ): RpcResponse<AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase58EncodedData>[]>;

    getProgramAccounts(
        program: Address,
        config: GetProgramAccountsApiCommonConfig &
            GetProgramAccountsApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base58';
                withContext?: boolean;
            }>
    ): AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase58EncodedData>[];

    getProgramAccounts(
        program: Address,
        config: GetProgramAccountsApiCommonConfig &
            GetProgramAccountsApiSliceableCommonConfig &
            Readonly<{
                withContext: true;
            }>
    ): RpcResponse<AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase58Bytes>[]>;

    getProgramAccounts(
        program: Address,
        config?: GetProgramAccountsApiCommonConfig &
            GetProgramAccountsApiSliceableCommonConfig &
            Readonly<{
                withContext?: boolean;
            }>
    ): AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase58Bytes>[];
}
