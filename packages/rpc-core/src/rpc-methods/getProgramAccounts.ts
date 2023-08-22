import { Base58EncodedAddress } from '@solana/addresses';

import {
    AccountInfoBase,
    AccountInfoWithBase58Bytes,
    AccountInfoWithBase58EncodedData,
    AccountInfoWithBase64EncodedData,
    AccountInfoWithBase64EncodedZStdCompressedData,
    AccountInfoWithJsonData,
    AccountInfoWithPubkey,
    Commitment,
    DataSlice,
    RpcResponse,
    Slot,
    U64UnsafeBeyond2Pow53Minus1,
} from './common';

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

type GetProgramAccountsApiContextConfig = Readonly<{
    withContext?: boolean;
}>;

type GetProgramAccountsApiSliceableCommonConfig = Readonly<{
    /** Limit the returned account data */
    dataSlice?: DataSlice;
}>;

type GetProgramAccountsApiResponseWithContextConfig<
    TContextConfig extends GetProgramAccountsApiContextConfig | void,
    TResponse,
> = TContextConfig extends object
    ? TContextConfig['withContext'] extends true
        ? RpcResponse<TResponse>
        : TResponse
    : TResponse;

export interface GetProgramAccountsApi {
    /**
     * Returns the account information for a list of Pubkeys.
     */
    getProgramAccounts<TContextConfig extends GetProgramAccountsApiContextConfig>(
        program: Base58EncodedAddress,
        config: GetProgramAccountsApiCommonConfig &
            GetProgramAccountsApiSliceableCommonConfig &
            TContextConfig &
            Readonly<{
                encoding: 'base64';
            }>,
    ): GetProgramAccountsApiResponseWithContextConfig<
        TContextConfig,
        AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase64EncodedData>[]
    >;

    getProgramAccounts<TContextConfig extends GetProgramAccountsApiContextConfig>(
        program: Base58EncodedAddress,
        config: GetProgramAccountsApiCommonConfig &
            GetProgramAccountsApiSliceableCommonConfig &
            TContextConfig &
            Readonly<{
                encoding: 'base64+zstd';
            }>,
    ): GetProgramAccountsApiResponseWithContextConfig<
        TContextConfig,
        AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase64EncodedZStdCompressedData>[]
    >;

    getProgramAccounts<TContextConfig extends GetProgramAccountsApiContextConfig>(
        program: Base58EncodedAddress,
        config: GetProgramAccountsApiCommonConfig &
            TContextConfig &
            Readonly<{
                encoding: 'jsonParsed';
            }>,
    ): GetProgramAccountsApiResponseWithContextConfig<
        TContextConfig,
        AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithJsonData>[]
    >;

    getProgramAccounts<TContextConfig extends GetProgramAccountsApiContextConfig>(
        program: Base58EncodedAddress,
        config: GetProgramAccountsApiCommonConfig &
            GetProgramAccountsApiSliceableCommonConfig &
            TContextConfig &
            Readonly<{
                encoding: 'base58';
            }>,
    ): GetProgramAccountsApiResponseWithContextConfig<
        TContextConfig,
        AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase58EncodedData>[]
    >;

    getProgramAccounts<TContextConfig extends GetProgramAccountsApiContextConfig>(
        program: Base58EncodedAddress,
        config?: GetProgramAccountsApiCommonConfig & GetProgramAccountsApiSliceableCommonConfig & TContextConfig,
    ): GetProgramAccountsApiResponseWithContextConfig<
        TContextConfig,
        AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase58Bytes>[]
    >;
}
