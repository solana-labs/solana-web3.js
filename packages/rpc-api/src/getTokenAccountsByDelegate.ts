import type { Address } from '@solana/addresses';
import type { JsonParsedTokenAccount } from '@solana/rpc-parsed-types';
import type { RpcApiMethods } from '@solana/rpc-spec';
import type {
    AccountInfoBase,
    AccountInfoWithBase58Bytes,
    AccountInfoWithBase58EncodedData,
    AccountInfoWithBase64EncodedData,
    AccountInfoWithBase64EncodedZStdCompressedData,
    AccountInfoWithPubkey,
    Commitment,
    DataSlice,
    Slot,
    SolanaRpcResponse,
    U64UnsafeBeyond2Pow53Minus1,
} from '@solana/rpc-types';

type TokenAccountInfoWithJsonData = Readonly<{
    data: Readonly<{
        parsed: {
            info: JsonParsedTokenAccount;
            type: 'account';
        };
        /** Name of the program that owns this account. */
        program: Address;
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

type GetTokenAccountsByDelegateApiCommonConfig = Readonly<{
    /** @defaultValue "finalized" */
    commitment?: Commitment;
    /** The minimum slot that the request can be evaluated at */
    minContextSlot?: Slot;
}>;

type GetTokenAccountsByDelegateApiSliceableCommonConfig = Readonly<{
    /** Limit the returned account data */
    dataSlice?: DataSlice;
}>;
export interface GetTokenAccountsByDelegateApi extends RpcApiMethods {
    /**
     * Returns all SPL Token accounts by approved Delegate.
     */
    getTokenAccountsByDelegate(
        program: Address,
        filter: AccountsFilter,
        config: GetTokenAccountsByDelegateApiCommonConfig &
            GetTokenAccountsByDelegateApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base64';
            }>,
    ): SolanaRpcResponse<AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase64EncodedData>[]>;

    getTokenAccountsByDelegate(
        program: Address,
        filter: AccountsFilter,
        config: GetTokenAccountsByDelegateApiCommonConfig &
            GetTokenAccountsByDelegateApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base64+zstd';
            }>,
    ): SolanaRpcResponse<AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase64EncodedZStdCompressedData>[]>;

    getTokenAccountsByDelegate(
        program: Address,
        filter: AccountsFilter,
        config: GetTokenAccountsByDelegateApiCommonConfig &
            Readonly<{
                encoding: 'jsonParsed';
            }>,
    ): SolanaRpcResponse<AccountInfoWithPubkey<AccountInfoBase & TokenAccountInfoWithJsonData>[]>;

    getTokenAccountsByDelegate(
        program: Address,
        filter: AccountsFilter,
        config: GetTokenAccountsByDelegateApiCommonConfig &
            GetTokenAccountsByDelegateApiSliceableCommonConfig &
            Readonly<{
                encoding: 'base58';
            }>,
    ): SolanaRpcResponse<AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase58EncodedData>[]>;

    getTokenAccountsByDelegate(
        program: Address,
        filter: AccountsFilter,
        config?: GetTokenAccountsByDelegateApiCommonConfig & GetTokenAccountsByDelegateApiSliceableCommonConfig,
    ): SolanaRpcResponse<AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase58Bytes>[]>;
}
