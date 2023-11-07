import { Address } from '@solana/addresses';
import { Commitment } from '@solana/rpc-types';

import {
    AccountInfoBase,
    AccountInfoWithBase58Bytes,
    AccountInfoWithBase58EncodedData,
    AccountInfoWithBase64EncodedData,
    AccountInfoWithBase64EncodedZStdCompressedData,
    AccountInfoWithPubkey,
    DataSlice,
    RpcResponse,
    Slot,
    TokenAccount,
    U64UnsafeBeyond2Pow53Minus1,
} from './common';

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

type MintFilter = Readonly<{
    /** Pubkey of the specific token Mint to limit accounts to */
    mint: Address;
}>;

type ProgramIdFilter = Readonly<{
    /** Pubkey of the Token program that owns the accounts */
    programId: Address;
}>;

type AccountsFilter = MintFilter | ProgramIdFilter;

type GetTokenAccountsByOwnerApiCommonConfig = Readonly<{
    /** @defaultValue "finalized" */
    commitment?: Commitment;
    /** The minimum slot that the request can be evaluated at */
    minContextSlot?: Slot;
}>;

type GetTokenAccountsByOwnerApiSliceableCommonConfig = Readonly<{
    /** Limit the returned account data */
    dataSlice?: DataSlice;
}>;
export interface GetTokenAccountsByOwnerApi {
    /**
     * Returns all SPL Token accounts by token owner.
     */
    getTokenAccountsByOwner(
        owner: Address,
        filter: AccountsFilter,
        config: GetTokenAccountsByOwnerApiCommonConfig &
            GetTokenAccountsByOwnerApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base64';
            }>
    ): RpcResponse<AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase64EncodedData>[]>;

    getTokenAccountsByOwner(
        owner: Address,
        filter: AccountsFilter,
        config: GetTokenAccountsByOwnerApiCommonConfig &
            GetTokenAccountsByOwnerApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base64+zstd';
            }>
    ): RpcResponse<AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase64EncodedZStdCompressedData>[]>;

    getTokenAccountsByOwner(
        owner: Address,
        filter: AccountsFilter,
        config: GetTokenAccountsByOwnerApiCommonConfig &
            Readonly<{
                encoding: 'jsonParsed';
            }>
    ): RpcResponse<AccountInfoWithPubkey<AccountInfoBase & TokenAccountInfoWithJsonData>[]>;

    getTokenAccountsByOwner(
        owner: Address,
        filter: AccountsFilter,
        config: GetTokenAccountsByOwnerApiCommonConfig &
            GetTokenAccountsByOwnerApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base58';
            }>
    ): RpcResponse<AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase58EncodedData>[]>;

    getTokenAccountsByOwner(
        owner: Address,
        filter: AccountsFilter,
        config?: GetTokenAccountsByOwnerApiCommonConfig & GetTokenAccountsByOwnerApiSliceableCommonConfig
    ): RpcResponse<AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase58Bytes>[]>;
}
