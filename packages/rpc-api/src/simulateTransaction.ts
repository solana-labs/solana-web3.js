import type { Address } from '@solana/addresses';
import type {
    AccountInfoBase,
    AccountInfoWithBase64EncodedData,
    AccountInfoWithBase64EncodedZStdCompressedData,
    AccountInfoWithJsonData,
    Base58EncodedBytes,
    Base64EncodedDataResponse,
    Commitment,
    Slot,
    SolanaRpcResponse,
    TransactionError,
    TransactionForFullMetaInnerInstructionsParsed,
    TransactionForFullMetaInnerInstructionsUnparsed,
    U64UnsafeBeyond2Pow53Minus1,
} from '@solana/rpc-types';
import type { Base64EncodedWireTransaction, TransactionBlockhashLifetime } from '@solana/transactions';

type SimulateTransactionConfigBase = Readonly<{
    /**
     * Commitment level to simulate the transaction at
     * @defaultValue finalized
     * */
    commitment?: Commitment;
    /**
     * If `true` the response will include inner instructions. These inner instructions will be
     * `jsonParsed` where possible, otherwise `json`.
     * @defaultValue false
     */
    innerInstructions?: boolean;
    /** The minimum slot that the request can be evaluated at */
    minContextSlot?: Slot;
}>;

// Both are optional booleans, but conflict - so cannot both be true
type SigVerifyAndReplaceRecentBlockhashConfig =
    | Readonly<{
          /** if `true` the transaction recent blockhash will be replaced with the most recent blockhash. (conflicts with `sigVerify`) */
          replaceRecentBlockhash: true;
          /** if `true` the transaction signatures will be verified (conflicts with `replaceRecentBlockhash`) */
          sigVerify?: false;
      }>
    | Readonly<{
          /** if `true` the transaction recent blockhash will be replaced with the most recent blockhash. (conflicts with `sigVerify`) */
          replaceRecentBlockhash?: false;
          /** if `true` the transaction signatures will be verified (conflicts with `replaceRecentBlockhash`) */
          sigVerify: true;
      }>
    | Readonly<{
          /** if `true` the transaction recent blockhash will be replaced with the most recent blockhash. (conflicts with `sigVerify`) */
          replaceRecentBlockhash?: false;
          /** if `true` the transaction signatures will be verified (conflicts with `replaceRecentBlockhash`) */
          sigVerify?: false;
      }>;

type AccountsConfigWithBase64EncodingZstdCompression = Readonly<{
    accounts: {
        /** An `array` of accounts to return */
        addresses: Address[];
        /** Encoding for returned Account data */
        encoding: 'base64+zstd';
    };
}>;

type AccountsConfigWithJsonParsedEncoding = Readonly<{
    accounts: {
        /** An `array` of accounts to return */
        addresses: Address[];
        /** Encoding for returned Account data */
        encoding: 'jsonParsed';
    };
}>;

type AccountsConfigWithBase64Encoding = Readonly<{
    accounts: {
        /** An `array` of accounts to return */
        addresses: Address[];
        // Optional because this is the default encoding
        /** Encoding for returned Account data */
        encoding?: 'base64';
    };
}>;

type WithInnerInstructionsConfig = Readonly<{
    innerInstructions: true;
}>;

type SimulateTransactionApiResponseBase = Readonly<{
    /** Error if transaction failed, null if transaction succeeded. */
    err: TransactionError | null;
    /** Array of log messages the transaction instructions output during execution, null if simulation failed before the transaction was able to execute (for example due to an invalid blockhash or signature verification failure) */
    logs: string[] | null;
    // TODO(https://github.com/solana-labs/solana-web3.js/issues/2869): Make it so that
    // `replacementBlockhash` only appears on the return type when `replaceRecentBlockhash` is set
    // to `true` in the call to `simulateTransaction`.
    /** The blockhash that was used to simulate the transaction when `replaceRecentBlockhash` is `true` */
    replacementBlockhash?: TransactionBlockhashLifetime;
    /** The most-recent return data generated by an instruction in the transaction */
    returnData: Readonly<{
        /** The return data itself, as base-64 encoded binary data */
        data: Base64EncodedDataResponse;
        /** The program that generated the return data */
        programId: Address;
    }> | null;
    /** The number of compute budget units consumed during the processing of this transaction */
    unitsConsumed?: U64UnsafeBeyond2Pow53Minus1;
}>;

type SimulateTransactionApiResponseWithAccounts<T extends AccountInfoBase> = Readonly<{
    /** Array of accounts with the same length as the `accounts.addresses` array in the request */
    accounts: (T | null)[];
}>;

type SimulateTransactionApiResponseWithInnerInstructions = Readonly<
    TransactionForFullMetaInnerInstructionsParsed | TransactionForFullMetaInnerInstructionsUnparsed
>;

export type SimulateTransactionApi = {
    /** @deprecated Set `encoding` to `'base64'` when calling this method */
    simulateTransaction(
        base58EncodedWireTransaction: Base58EncodedBytes,
        config: AccountsConfigWithBase64Encoding &
            SigVerifyAndReplaceRecentBlockhashConfig &
            SimulateTransactionConfigBase &
            WithInnerInstructionsConfig,
    ): SolanaRpcResponse<
        SimulateTransactionApiResponseBase &
            SimulateTransactionApiResponseWithAccounts<AccountInfoBase & AccountInfoWithBase64EncodedData> &
            SimulateTransactionApiResponseWithInnerInstructions
    >;

    /** @deprecated Set `encoding` to `'base64'` when calling this method */
    simulateTransaction(
        base58EncodedWireTransaction: Base58EncodedBytes,
        config: AccountsConfigWithBase64Encoding &
            SigVerifyAndReplaceRecentBlockhashConfig &
            SimulateTransactionConfigBase,
    ): SolanaRpcResponse<
        SimulateTransactionApiResponseBase &
            SimulateTransactionApiResponseWithAccounts<AccountInfoBase & AccountInfoWithBase64EncodedData>
    >;

    /** @deprecated Set `encoding` to `'base64'` when calling this method */
    simulateTransaction(
        base58EncodedWireTransaction: Base58EncodedBytes,
        config: AccountsConfigWithBase64EncodingZstdCompression &
            SigVerifyAndReplaceRecentBlockhashConfig &
            SimulateTransactionConfigBase &
            WithInnerInstructionsConfig,
    ): SolanaRpcResponse<
        SimulateTransactionApiResponseBase &
            SimulateTransactionApiResponseWithAccounts<
                AccountInfoBase & AccountInfoWithBase64EncodedZStdCompressedData
            > &
            SimulateTransactionApiResponseWithInnerInstructions
    >;

    /** @deprecated Set `encoding` to `'base64'` when calling this method */
    simulateTransaction(
        base58EncodedWireTransaction: Base58EncodedBytes,
        config: AccountsConfigWithBase64EncodingZstdCompression &
            SigVerifyAndReplaceRecentBlockhashConfig &
            SimulateTransactionConfigBase,
    ): SolanaRpcResponse<
        SimulateTransactionApiResponseBase &
            SimulateTransactionApiResponseWithAccounts<AccountInfoBase & AccountInfoWithBase64EncodedZStdCompressedData>
    >;

    /** @deprecated Set `encoding` to `'base64'` when calling this method */
    simulateTransaction(
        base58EncodedWireTransaction: Base58EncodedBytes,
        config: AccountsConfigWithJsonParsedEncoding &
            SigVerifyAndReplaceRecentBlockhashConfig &
            SimulateTransactionConfigBase &
            WithInnerInstructionsConfig,
    ): SolanaRpcResponse<
        SimulateTransactionApiResponseBase &
            SimulateTransactionApiResponseWithAccounts<AccountInfoBase & AccountInfoWithJsonData> &
            SimulateTransactionApiResponseWithInnerInstructions
    >;

    /** @deprecated Set `encoding` to `'base64'` when calling this method */
    simulateTransaction(
        base58EncodedWireTransaction: Base58EncodedBytes,
        config: AccountsConfigWithJsonParsedEncoding &
            SigVerifyAndReplaceRecentBlockhashConfig &
            SimulateTransactionConfigBase,
    ): SolanaRpcResponse<
        SimulateTransactionApiResponseBase &
            SimulateTransactionApiResponseWithAccounts<AccountInfoBase & AccountInfoWithJsonData>
    >;

    /** @deprecated Set `encoding` to `'base64'` when calling this method */
    simulateTransaction(
        base58EncodedWireTransaction: Base58EncodedBytes,
        config?: SigVerifyAndReplaceRecentBlockhashConfig & SimulateTransactionConfigBase & WithInnerInstructionsConfig,
    ): SolanaRpcResponse<
        Readonly<{ readonly accounts: null }> &
            SimulateTransactionApiResponseBase &
            SimulateTransactionApiResponseWithInnerInstructions
    >;

    /** @deprecated Set `encoding` to `'base64'` when calling this method */
    simulateTransaction(
        base58EncodedWireTransaction: Base58EncodedBytes,
        config?: SigVerifyAndReplaceRecentBlockhashConfig & SimulateTransactionConfigBase,
    ): SolanaRpcResponse<Readonly<{ readonly accounts: null }> & SimulateTransactionApiResponseBase>;

    /** Simulate sending a transaction */
    simulateTransaction(
        base64EncodedWireTransaction: Base64EncodedWireTransaction,
        config: AccountsConfigWithBase64Encoding &
            SigVerifyAndReplaceRecentBlockhashConfig &
            SimulateTransactionConfigBase &
            WithInnerInstructionsConfig & { encoding: 'base64' },
    ): SolanaRpcResponse<
        SimulateTransactionApiResponseBase &
            SimulateTransactionApiResponseWithAccounts<AccountInfoBase & AccountInfoWithBase64EncodedData> &
            SimulateTransactionApiResponseWithInnerInstructions
    >;

    /** Simulate sending a transaction */
    simulateTransaction(
        base64EncodedWireTransaction: Base64EncodedWireTransaction,
        config: AccountsConfigWithBase64Encoding &
            SigVerifyAndReplaceRecentBlockhashConfig &
            SimulateTransactionConfigBase & { encoding: 'base64' },
    ): SolanaRpcResponse<
        SimulateTransactionApiResponseBase &
            SimulateTransactionApiResponseWithAccounts<AccountInfoBase & AccountInfoWithBase64EncodedData>
    >;

    /** Simulate sending a transaction */
    simulateTransaction(
        base64EncodedWireTransaction: Base64EncodedWireTransaction,
        config: AccountsConfigWithBase64EncodingZstdCompression &
            SigVerifyAndReplaceRecentBlockhashConfig &
            SimulateTransactionConfigBase &
            WithInnerInstructionsConfig & { encoding: 'base64' },
    ): SolanaRpcResponse<
        SimulateTransactionApiResponseBase &
            SimulateTransactionApiResponseWithAccounts<
                AccountInfoBase & AccountInfoWithBase64EncodedZStdCompressedData
            > &
            SimulateTransactionApiResponseWithInnerInstructions
    >;

    /** Simulate sending a transaction */
    simulateTransaction(
        base64EncodedWireTransaction: Base64EncodedWireTransaction,
        config: AccountsConfigWithBase64EncodingZstdCompression &
            SigVerifyAndReplaceRecentBlockhashConfig &
            SimulateTransactionConfigBase & { encoding: 'base64' },
    ): SolanaRpcResponse<
        SimulateTransactionApiResponseBase &
            SimulateTransactionApiResponseWithAccounts<AccountInfoBase & AccountInfoWithBase64EncodedZStdCompressedData>
    >;

    /** Simulate sending a transaction */
    simulateTransaction(
        base64EncodedWireTransaction: Base64EncodedWireTransaction,
        config: AccountsConfigWithJsonParsedEncoding &
            SigVerifyAndReplaceRecentBlockhashConfig &
            SimulateTransactionConfigBase &
            WithInnerInstructionsConfig & { encoding: 'base64' },
    ): SolanaRpcResponse<
        SimulateTransactionApiResponseBase &
            SimulateTransactionApiResponseWithAccounts<AccountInfoBase & AccountInfoWithJsonData> &
            SimulateTransactionApiResponseWithInnerInstructions
    >;

    /** Simulate sending a transaction */
    simulateTransaction(
        base64EncodedWireTransaction: Base64EncodedWireTransaction,
        config: AccountsConfigWithJsonParsedEncoding &
            SigVerifyAndReplaceRecentBlockhashConfig &
            SimulateTransactionConfigBase & { encoding: 'base64' },
    ): SolanaRpcResponse<
        SimulateTransactionApiResponseBase &
            SimulateTransactionApiResponseWithAccounts<AccountInfoBase & AccountInfoWithJsonData>
    >;

    /** Simulate sending a transaction */
    simulateTransaction(
        base64EncodedWireTransaction: Base64EncodedWireTransaction,
        config: SigVerifyAndReplaceRecentBlockhashConfig &
            SimulateTransactionConfigBase &
            WithInnerInstructionsConfig & { encoding: 'base64' },
    ): SolanaRpcResponse<
        Readonly<{ readonly accounts: null }> &
            SimulateTransactionApiResponseBase &
            SimulateTransactionApiResponseWithInnerInstructions
    >;

    /** Simulate sending a transaction */
    simulateTransaction(
        base64EncodedWireTransaction: Base64EncodedWireTransaction,
        config: SigVerifyAndReplaceRecentBlockhashConfig & SimulateTransactionConfigBase & { encoding: 'base64' },
    ): SolanaRpcResponse<Readonly<{ readonly accounts: null }> & SimulateTransactionApiResponseBase>;
};
