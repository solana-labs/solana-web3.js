import type { Address } from '@solana/addresses';
import type { RpcApiMethods } from '@solana/rpc-spec';
import type {
    AccountInfoBase,
    AccountInfoWithBase58Bytes,
    AccountInfoWithBase58EncodedData,
    AccountInfoWithBase64EncodedData,
    AccountInfoWithBase64EncodedZStdCompressedData,
    AccountInfoWithJsonData,
    AccountInfoWithPubkey,
    Commitment,
    DataSlice,
    GetProgramAccountsDatasizeFilter,
    GetProgramAccountsMemcmpFilter,
    Slot,
    SolanaRpcResponse,
} from '@solana/rpc-types';

type GetProgramAccountsApiCommonConfig = Readonly<{
    /** @defaultValue "finalized" */
    commitment?: Commitment;
    /** filter results (up to 4 filters allowed) @see https://docs.solana.com/api/http#filter-criteria */
    filters?: (GetProgramAccountsDatasizeFilter | GetProgramAccountsMemcmpFilter)[];
    /** The minimum slot that the request can be evaluated at */
    minContextSlot?: Slot;
}>;

type GetProgramAccountsApiSliceableCommonConfig = Readonly<{
    /** Limit the returned account data */
    dataSlice?: DataSlice;
}>;
export interface GetProgramAccountsApi extends RpcApiMethods {
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
            }>,
    ): SolanaRpcResponse<AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase64EncodedData>[]>;

    getProgramAccounts(
        program: Address,
        config: GetProgramAccountsApiCommonConfig &
            GetProgramAccountsApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base64';
                withContext?: boolean;
            }>,
    ): AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase64EncodedData>[];

    getProgramAccounts(
        program: Address,
        config: GetProgramAccountsApiCommonConfig &
            GetProgramAccountsApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base64+zstd';
                withContext: true;
            }>,
    ): SolanaRpcResponse<AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase64EncodedZStdCompressedData>[]>;

    getProgramAccounts(
        program: Address,
        config: GetProgramAccountsApiCommonConfig &
            GetProgramAccountsApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base64+zstd';
                withContext?: boolean;
            }>,
    ): AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase64EncodedZStdCompressedData>[];

    getProgramAccounts(
        program: Address,
        config: GetProgramAccountsApiCommonConfig &
            Readonly<{
                encoding: 'jsonParsed';
                withContext: true;
            }>,
    ): SolanaRpcResponse<AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithJsonData>[]>;

    getProgramAccounts(
        program: Address,
        config: GetProgramAccountsApiCommonConfig &
            Readonly<{
                encoding: 'jsonParsed';
                withContext?: boolean;
            }>,
    ): AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithJsonData>[];

    getProgramAccounts(
        program: Address,
        config: GetProgramAccountsApiCommonConfig &
            GetProgramAccountsApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base58';
                withContext: true;
            }>,
    ): SolanaRpcResponse<AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase58EncodedData>[]>;

    getProgramAccounts(
        program: Address,
        config: GetProgramAccountsApiCommonConfig &
            GetProgramAccountsApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base58';
                withContext?: boolean;
            }>,
    ): AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase58EncodedData>[];

    getProgramAccounts(
        program: Address,
        config: GetProgramAccountsApiCommonConfig &
            GetProgramAccountsApiSliceableCommonConfig &
            Readonly<{
                withContext: true;
            }>,
    ): SolanaRpcResponse<AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase58Bytes>[]>;

    getProgramAccounts(
        program: Address,
        config?: GetProgramAccountsApiCommonConfig &
            GetProgramAccountsApiSliceableCommonConfig &
            Readonly<{
                withContext?: boolean;
            }>,
    ): AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase58Bytes>[];
}
