import type { Address } from '@solana/addresses';
import type { RpcApiMethods } from '@solana/rpc-spec';
import type {
    AccountInfoBase,
    AccountInfoWithBase58Bytes,
    AccountInfoWithBase58EncodedData,
    AccountInfoWithBase64EncodedData,
    AccountInfoWithBase64EncodedZStdCompressedData,
    AccountInfoWithJsonData,
    Commitment,
    DataSlice,
    Slot,
    SolanaRpcResponse,
} from '@solana/rpc-types';

type GetAccountInfoApiResponseBase = SolanaRpcResponse<AccountInfoBase | null>;

type NestInRpcResponseOrNull<T> = Readonly<{
    value: T | null;
}>;

type GetAccountInfoApiCommonConfig = Readonly<{
    // Defaults to `finalized`
    commitment?: Commitment;
    // The minimum slot that the request can be evaluated at
    minContextSlot?: Slot;
}>;

type GetAccountInfoApiSliceableCommonConfig = Readonly<{
    // Limit the returned account data using the provided "offset: <usize>" and "length: <usize>" fields.
    dataSlice?: DataSlice;
}>;

export interface GetAccountInfoApi extends RpcApiMethods {
    /**
     * Returns all information associated with the account of provided public key
     */
    getAccountInfo(
        address: Address,
        config: GetAccountInfoApiCommonConfig &
            GetAccountInfoApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base64';
            }>,
    ): GetAccountInfoApiResponseBase & NestInRpcResponseOrNull<AccountInfoWithBase64EncodedData>;
    getAccountInfo(
        address: Address,
        config: GetAccountInfoApiCommonConfig &
            GetAccountInfoApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base64+zstd';
            }>,
    ): GetAccountInfoApiResponseBase & NestInRpcResponseOrNull<AccountInfoWithBase64EncodedZStdCompressedData>;
    getAccountInfo(
        address: Address,
        config: GetAccountInfoApiCommonConfig &
            Readonly<{
                encoding: 'jsonParsed';
            }>,
    ): GetAccountInfoApiResponseBase & NestInRpcResponseOrNull<AccountInfoWithJsonData>;
    getAccountInfo(
        address: Address,
        config: GetAccountInfoApiCommonConfig &
            GetAccountInfoApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base58';
            }>,
    ): GetAccountInfoApiResponseBase & NestInRpcResponseOrNull<AccountInfoWithBase58EncodedData>;
    getAccountInfo(
        address: Address,
        config?: GetAccountInfoApiCommonConfig,
    ): GetAccountInfoApiResponseBase & NestInRpcResponseOrNull<AccountInfoWithBase58Bytes>;
}
