import { Base58EncodedAddress } from '@solana/addresses';
import { Blockhash, TransactionVersion } from '@solana/transactions';

import { TransactionError } from '../transaction-error';
import { UnixTimestamp } from '../unix-timestamp';
import {
    Base58EncodedBytes,
    Base58EncodedDataResponse,
    Base64EncodedDataResponse,
    Commitment,
    LamportsUnsafeBeyond2Pow53Minus1,
    Reward,
    Slot,
    TokenBalance,
    TransactionStatus,
    U64UnsafeBeyond2Pow53Minus1,
} from './common';

// Shared transaction components

type AddressTableLookup = Readonly<{
    /** public key for an address lookup table account. */
    accountKey: Base58EncodedAddress;
    /** List of indices used to load addresses of writable accounts from a lookup table. */
    writableIndexes: readonly number[];
    /** List of indices used to load addresses of readonly accounts from a lookup table. */
    readableIndexes: readonly number[];
}>;

type ParsedTransactionInstruction = Readonly<{
    parsed: {
        type: string;
        info?: object;
    };
    program: string;
    programId: Base58EncodedAddress;
}>;

type PartiallyDecodedTransactionInstruction = Readonly<{
    accounts: readonly Base58EncodedAddress[];
    data: Base58EncodedBytes;
    programId: Base58EncodedAddress;
}>;

type ReturnData = {
    /** the program that generated the return data */
    programId: Base58EncodedAddress;
    /** the return data itself */
    data: Base64EncodedDataResponse;
};

type TransactionInstruction = Readonly<{
    accounts: readonly number[];
    data: Base58EncodedBytes;
    programIdIndex: number;
}>;

type TransactionParsedAccountLegacy = Readonly<{
    pubkey: Base58EncodedAddress;
    signer: boolean;
    source: 'transaction';
    writable: boolean;
}>;
type TransactionParsedAccountVersioned = Readonly<{
    pubkey: Base58EncodedAddress;
    signer: boolean;
    source: 'lookupTable' | 'transaction';
    writable: boolean;
}>;

// Types for `accounts` transactionDetails

// Only a partial version of the `TransactionMetaBase` type for when `transactionDetails: accounts` is provided.
type TransactionForAccountsMetaBase = Readonly<{
    /** Error if transaction failed, null if transaction succeeded. */
    err: TransactionError | null;
    /** fee this transaction was charged */
    fee: LamportsUnsafeBeyond2Pow53Minus1;
    /** array of account balances from before the transaction was processed */
    preBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
    /** array of account balances after the transaction was processed */
    postBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
    /** List of token balances from before the transaction was processed or omitted if token balance recording was not yet enabled during this transaction */
    preTokenBalances?: readonly TokenBalance[];
    /** List of token balances from after the transaction was processed or omitted if token balance recording was not yet enabled during this transaction */
    postTokenBalances?: readonly TokenBalance[];
    /**
     * Transaction status
     * @deprecated
     */
    status: TransactionStatus;
}>;

// Accounts

type TransactionForAccounts<TMaxSupportedTransactionVersion extends TransactionVersion | void> =
    TMaxSupportedTransactionVersion extends void
        ? Readonly<{
              /** Transaction partial meta */
              meta: TransactionForAccountsMetaBase | null;
              /** Partial transactions */
              transaction: Readonly<{
                  /** Parsed accounts */
                  accountKeys: readonly TransactionParsedAccountLegacy[];
                  /** Account signatures */
                  signatures: readonly Base58EncodedBytes[];
              }>;
          }>
        : Readonly<{
              /** Transaction partial meta */
              meta: TransactionForAccountsMetaBase | null;
              /** Partial transactions */
              transaction: Readonly<{
                  /** Parsed accounts */
                  accountKeys: readonly TransactionParsedAccountVersioned[];
                  /** Account signatures */
                  signatures: readonly Base58EncodedBytes[];
              }>;
              /** The transaction version */
              version: TransactionVersion;
          }>;

// Types for `full` transactionDetails

type TransactionForFullMetaBase = Readonly<{
    /** number of compute units consumed by the transaction */
    computeUnitsConsumed?: U64UnsafeBeyond2Pow53Minus1;
    /** Error if transaction failed, null if transaction succeeded. */
    err: TransactionError | null;
    /** fee this transaction was charged */
    fee: LamportsUnsafeBeyond2Pow53Minus1;
    /** array of string log messages or null if log message recording was not enabled during this transaction */
    logMessages: readonly string[] | null;
    /** array of account balances from before the transaction was processed */
    preBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
    /** array of account balances after the transaction was processed */
    postBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
    /** List of token balances from before the transaction was processed or omitted if token balance recording was not yet enabled during this transaction */
    preTokenBalances?: readonly TokenBalance[];
    /** List of token balances from after the transaction was processed or omitted if token balance recording was not yet enabled during this transaction */
    postTokenBalances?: readonly TokenBalance[];
    /** the most-recent return data generated by an instruction in the transaction */
    returnData?: ReturnData;
    /** transaction-level rewards */
    rewards: readonly Reward[] | null;
    /**
     * Transaction status
     * @deprecated
     */
    status: TransactionStatus;
}>;

type TransactionForFullMetaInnerInstructionsUnparsed = Readonly<{
    innerInstructions: readonly Readonly<{
        /** The index of the instruction in the transaction */
        index: number;
        /** The instruction */
        instructions: readonly TransactionInstruction[];
    }>[];
}>;

type TransactionForFullMetaInnerInstructionsParsed = Readonly<{
    innerInstructions: readonly Readonly<{
        /** The index of the instruction in the transaction */
        index: number;
        /** The instruction */
        instructions: readonly (ParsedTransactionInstruction | PartiallyDecodedTransactionInstruction)[];
    }>[];
}>;

// According to the RPC docs: "Transaction addresses loaded from address lookup tables.
// Undefined if maxSupportedTransactionVersion is not set in request params, or if jsonParsed
// encoding is set in request params."
type TransactionForFullMetaLoadedAddresses = Readonly<{
    /** Addresses loaded from lookup tables */
    loadedAddresses: {
        writable: readonly Base58EncodedAddress[];
        readonly: readonly Base58EncodedAddress[];
    };
}>;

type TransactionForFullTransactionAddressTableLookups = Readonly<{
    message: {
        addressTableLookups?: readonly AddressTableLookup[] | null;
    };
}>;

// Base58

type TransactionForFullBase58<TMaxSupportedTransactionVersion extends TransactionVersion | void> =
    TMaxSupportedTransactionVersion extends void
        ? Readonly<{
              /** Transaction meta */
              meta: (TransactionForFullMetaBase & TransactionForFullMetaInnerInstructionsUnparsed) | null;
              /** Partial transactions */
              transaction: Base58EncodedDataResponse;
          }>
        : Readonly<{
              /** Transaction meta */
              meta:
                  | (TransactionForFullMetaBase &
                        TransactionForFullMetaInnerInstructionsUnparsed &
                        TransactionForFullMetaLoadedAddresses)
                  | null;
              /** Partial transactions */
              transaction: Base58EncodedDataResponse;
              /** The transaction version */
              version: TransactionVersion;
          }>;

// Base64

type TransactionForFullBase64<TMaxSupportedTransactionVersion extends TransactionVersion | void> =
    TMaxSupportedTransactionVersion extends void
        ? Readonly<{
              /** Transaction meta */
              meta: (TransactionForFullMetaBase & TransactionForFullMetaInnerInstructionsUnparsed) | null;
              /** Partial transactions */
              transaction: Base64EncodedDataResponse;
          }>
        : Readonly<{
              /** Transaction meta */
              meta:
                  | (TransactionForFullMetaBase &
                        TransactionForFullMetaInnerInstructionsUnparsed &
                        TransactionForFullMetaLoadedAddresses)
                  | null;
              /** Partial transactions */
              transaction: Base64EncodedDataResponse;
              /** The transaction version */
              version: TransactionVersion;
          }>;

// JsonParsed

type TransactionForFullTransactionJsonParsedBase = Readonly<{
    message: {
        header: {
            numReadonlySignedAccounts: number;
            numReadonlyUnsignedAccounts: number;
            numRequiredSignatures: number;
        };
        instructions: readonly (ParsedTransactionInstruction | PartiallyDecodedTransactionInstruction)[];
        recentBlockhash: Blockhash;
    };
    signatures: readonly Base58EncodedBytes[];
}>;
type TransactionForFullJsonParsed<TMaxSupportedTransactionVersion extends TransactionVersion | void> =
    TMaxSupportedTransactionVersion extends void
        ? Readonly<{
              meta: (TransactionForFullMetaBase & TransactionForFullMetaInnerInstructionsParsed) | null;
              transaction: TransactionForFullTransactionJsonParsedBase & {
                  message: Readonly<{
                      accountKeys: readonly TransactionParsedAccountLegacy[];
                  }>;
              };
          }>
        : Readonly<{
              meta:
                  | (TransactionForFullMetaBase &
                        TransactionForFullMetaInnerInstructionsParsed &
                        TransactionForFullMetaLoadedAddresses)
                  | null;
              transaction: TransactionForFullTransactionJsonParsedBase & {
                  message: Readonly<{
                      accountKeys: readonly TransactionParsedAccountLegacy[];
                  }>;
              };
              version: TransactionVersion;
          }>;

// Json

type TransactionForFullTransactionJsonBase = Readonly<{
    message: {
        accountKeys: readonly Base58EncodedAddress[];
        header: {
            numReadonlySignedAccounts: number;
            numReadonlyUnsignedAccounts: number;
            numRequiredSignatures: number;
        };
        instructions: readonly TransactionInstruction[];
        recentBlockhash: Blockhash;
    };
    signatures: readonly Base58EncodedBytes[];
}>;
type TransactionForFullJson<TMaxSupportedTransactionVersion extends TransactionVersion | void> =
    TMaxSupportedTransactionVersion extends void
        ? Readonly<{
              meta: (TransactionForFullMetaBase & TransactionForFullMetaInnerInstructionsUnparsed) | null;
              transaction: TransactionForFullTransactionJsonBase;
          }>
        : Readonly<{
              meta:
                  | (TransactionForFullMetaBase &
                        TransactionForFullMetaInnerInstructionsUnparsed &
                        TransactionForFullMetaLoadedAddresses)
                  | null;
              transaction: TransactionForFullTransactionJsonBase & TransactionForFullTransactionAddressTableLookups;
              version: TransactionVersion;
          }>;

// API response types

type GetBlockApiResponseBase = Readonly<{
    /** the blockhash of this block */
    blockhash: Blockhash;
    /** The number of blocks beneath this block */
    blockHeight: U64UnsafeBeyond2Pow53Minus1;
    /** The number of blocks beneath this block */
    blockTime: UnixTimestamp;
    /** The slot index of this block's parent */
    parentSlot: Slot;
    /** The blockhash of this block's parent */
    previousBlockhash: Blockhash;
}>;

type GetBlockApiResponseWithRewards = Readonly<{
    /** Block-level rewards */
    rewards: readonly Reward[];
}>;

type GetBlockApiResponseWithSignatures = Readonly<{
    /** List of signatures applied to transactions in this block */
    signatures: readonly Base58EncodedBytes[];
}>;

type GetBlockApiResponseWithTransactions<TTransaction> = Readonly<{
    transactions: readonly TTransaction[];
}>;

// API parameter types

type GetBlockCommonConfig = Readonly<{
    /** @defaultValue finalized */
    commitment?: Omit<Commitment, 'processed'>;
}>;

type GetBlockEncoding = 'base58' | 'base64' | 'json' | 'jsonParsed';

// Max supported transaction version parameter:
// - `maxSupportedTransactionVersion` can only be provided with a number value. "legacy" is not a valid argument.
// This will throw a parse error (code -32602).
// - If `maxSupportedTransactionVersion` is not provided, the default value is "legacy".
// This will error if the block contains any transactions with a version greater than "legacy" (code -32015).
// - Also, If `maxSupportedTransactionVersion` is not provided, the `version` field of each transaction is omitted.
// - These rules apply to both "accounts" and "full" transaction details.
type GetBlockMaxSupportedTransactionVersion = Exclude<TransactionVersion, 'legacy'>;

export interface GetBlockApi {
    /**
     * Returns identity and transaction information about a confirmed block in the ledger
     */
    // transactionDetails=none, rewards=false, encoding + maxSupportedTransactionVersion irrelevant
    getBlock(
        slot: Slot,
        config: GetBlockCommonConfig &
            Readonly<{
                encoding?: GetBlockEncoding;
                maxSupportedTransactionVersion?: GetBlockMaxSupportedTransactionVersion;
                rewards: false;
                transactionDetails: 'none';
            }>
    ): GetBlockApiResponseBase | null;
    // transactionDetails=none, rewards=missing/true, encoding + maxSupportedTransactionVersion irrelevant
    getBlock(
        slot: Slot,
        config: GetBlockCommonConfig &
            Readonly<{
                encoding?: GetBlockEncoding;
                maxSupportedTransactionVersion?: GetBlockMaxSupportedTransactionVersion;
                rewards?: true;
                transactionDetails: 'none';
            }>
    ): (GetBlockApiResponseBase & GetBlockApiResponseWithRewards) | null;
    // transactionDetails=signatures, rewards=false, encoding + maxSupportedTransactionVersion irrelevant
    getBlock(
        slot: Slot,
        config: GetBlockCommonConfig &
            Readonly<{
                encoding?: GetBlockEncoding;
                maxSupportedTransactionVersion?: GetBlockMaxSupportedTransactionVersion;
                rewards: false;
                transactionDetails: 'signatures';
            }>
    ): (GetBlockApiResponseBase & GetBlockApiResponseWithSignatures) | null;
    // transactionDetails=signatures, rewards=missing/true, encoding + maxSupportedTransactionVersion irrelevant
    getBlock(
        slot: Slot,
        config: GetBlockCommonConfig &
            Readonly<{
                encoding?: GetBlockEncoding;
                maxSupportedTransactionVersion?: GetBlockMaxSupportedTransactionVersion;
                rewards?: true;
                transactionDetails: 'signatures';
            }>
    ): (GetBlockApiResponseBase & GetBlockApiResponseWithRewards & GetBlockApiResponseWithSignatures) | null;
    // transactionDetails=accounts, rewards=false, maxSupportedTransactionVersion=0, encoding irrelevant
    getBlock(
        slot: Slot,
        config: GetBlockCommonConfig &
            Readonly<{
                encoding?: GetBlockEncoding;
                maxSupportedTransactionVersion: GetBlockMaxSupportedTransactionVersion;
                rewards: false;
                transactionDetails: 'accounts';
            }>
    ):
        | (GetBlockApiResponseBase &
              GetBlockApiResponseWithTransactions<TransactionForAccounts<GetBlockMaxSupportedTransactionVersion>>)
        | null;
    // // transactionDetails=accounts, rewards=false, maxSupportedTransactionVersion=missing, encoding irrelevant
    getBlock(
        slot: Slot,
        config: GetBlockCommonConfig &
            Readonly<{
                encoding?: GetBlockEncoding;
                rewards: false;
                transactionDetails: 'accounts';
            }>
    ): (GetBlockApiResponseBase & GetBlockApiResponseWithTransactions<TransactionForAccounts<void>>) | null;
    // transactionDetails=accounts, rewards=missing/true, maxSupportedTransactionVersion=0, encoding irrelevant
    getBlock(
        slot: Slot,
        config: GetBlockCommonConfig &
            Readonly<{
                encoding?: GetBlockEncoding;
                maxSupportedTransactionVersion: GetBlockMaxSupportedTransactionVersion;
                rewards?: true;
                transactionDetails: 'accounts';
            }>
    ):
        | (GetBlockApiResponseBase &
              GetBlockApiResponseWithRewards &
              GetBlockApiResponseWithTransactions<TransactionForAccounts<GetBlockMaxSupportedTransactionVersion>>)
        | null;
    // transactionDetails=accounts, rewards=missing/true, maxSupportedTransactionVersion=missing, encoding irrelevant
    getBlock(
        slot: Slot,
        config: GetBlockCommonConfig &
            Readonly<{
                encoding?: GetBlockEncoding;
                rewards?: true;
                transactionDetails: 'accounts';
            }>
    ):
        | (GetBlockApiResponseBase &
              GetBlockApiResponseWithRewards &
              GetBlockApiResponseWithTransactions<TransactionForAccounts<void>>)
        | null;
    // transactionDetails=full (default), encoding=base58, rewards=false, maxSupportedTransactionVersion=0
    getBlock(
        slot: Slot,
        config: GetBlockCommonConfig &
            Readonly<{
                encoding: 'base58';
                maxSupportedTransactionVersion: GetBlockMaxSupportedTransactionVersion;
                rewards: false;
                transactionDetails?: 'full';
            }>
    ):
        | (GetBlockApiResponseBase &
              GetBlockApiResponseWithTransactions<TransactionForFullBase58<GetBlockMaxSupportedTransactionVersion>>)
        | null;
    // transactionDetails=full (default), encoding=base58, rewards=false, maxSupportedTransactionVersion=missing
    getBlock(
        slot: Slot,
        config: GetBlockCommonConfig &
            Readonly<{
                encoding: 'base58';
                rewards: false;
                transactionDetails?: 'full';
            }>
    ): (GetBlockApiResponseBase & GetBlockApiResponseWithTransactions<TransactionForFullBase58<void>>) | null;
    // transactionDetails=full (default), encoding=base58, rewards=missing/true, maxSupportedTransactionVersion=0
    getBlock(
        slot: Slot,
        config: GetBlockCommonConfig &
            Readonly<{
                encoding: 'base58';
                maxSupportedTransactionVersion: GetBlockMaxSupportedTransactionVersion;
                rewards?: true;
                transactionDetails?: 'full';
            }>
    ):
        | (GetBlockApiResponseBase &
              GetBlockApiResponseWithRewards &
              GetBlockApiResponseWithTransactions<TransactionForFullBase58<GetBlockMaxSupportedTransactionVersion>>)
        | null;
    // transactionDetails=full (default), encoding=base58, rewards=missing/true, maxSupportedTransactionVersion=missing
    getBlock(
        slot: Slot,
        config: GetBlockCommonConfig &
            Readonly<{
                encoding: 'base58';
                rewards?: true;
                transactionDetails?: 'full';
            }>
    ):
        | (GetBlockApiResponseBase &
              GetBlockApiResponseWithRewards &
              GetBlockApiResponseWithTransactions<TransactionForFullBase58<void>>)
        | null;
    // transactionDetails=full (default), encoding=base64, rewards=false, maxSupportedTransactionVersion=0
    getBlock(
        slot: Slot,
        config: GetBlockCommonConfig &
            Readonly<{
                encoding: 'base64';
                maxSupportedTransactionVersion: GetBlockMaxSupportedTransactionVersion;
                rewards: false;
                transactionDetails?: 'full';
            }>
    ):
        | (GetBlockApiResponseBase &
              GetBlockApiResponseWithTransactions<TransactionForFullBase64<GetBlockMaxSupportedTransactionVersion>>)
        | null;
    // transactionDetails=full (default), encoding=base64, rewards=false, maxSupportedTransactionVersion=missing
    getBlock(
        slot: Slot,
        config: GetBlockCommonConfig &
            Readonly<{
                encoding: 'base64';
                rewards: false;
                transactionDetails?: 'full';
            }>
    ): (GetBlockApiResponseBase & GetBlockApiResponseWithTransactions<TransactionForFullBase64<void>>) | null;
    // transactionDetails=full (default), encoding=base64, rewards=missing/true, maxSupportedTransactionVersion=0
    getBlock(
        slot: Slot,
        config: GetBlockCommonConfig &
            Readonly<{
                encoding: 'base64';
                maxSupportedTransactionVersion: GetBlockMaxSupportedTransactionVersion;
                rewards?: true;
                transactionDetails?: 'full';
            }>
    ):
        | (GetBlockApiResponseBase &
              GetBlockApiResponseWithRewards &
              GetBlockApiResponseWithTransactions<TransactionForFullBase64<GetBlockMaxSupportedTransactionVersion>>)
        | null;
    // transactionDetails=full (default), encoding=base64, rewards=missing/true, maxSupportedTransactionVersion=missing
    getBlock(
        slot: Slot,
        config: GetBlockCommonConfig &
            Readonly<{
                encoding: 'base64';
                rewards?: true;
                transactionDetails?: 'full';
            }>
    ):
        | (GetBlockApiResponseBase &
              GetBlockApiResponseWithRewards &
              GetBlockApiResponseWithTransactions<TransactionForFullBase64<void>>)
        | null;
    // transactionDetails=full (default), encoding=jsonParsed, rewards=false, maxSupportedTransactionVersion=0
    getBlock(
        slot: Slot,
        config: GetBlockCommonConfig &
            Readonly<{
                encoding: 'jsonParsed';
                maxSupportedTransactionVersion: GetBlockMaxSupportedTransactionVersion;
                rewards: false;
                transactionDetails?: 'full';
            }>
    ):
        | (GetBlockApiResponseBase &
              GetBlockApiResponseWithTransactions<TransactionForFullJsonParsed<GetBlockMaxSupportedTransactionVersion>>)
        | null;
    // transactionDetails=full (default), encoding=jsonParsed, rewards=false, maxSupportedTransactionVersion=missing
    getBlock(
        slot: Slot,
        config: GetBlockCommonConfig &
            Readonly<{
                encoding: 'jsonParsed';
                rewards: false;
                transactionDetails?: 'full';
            }>
    ): (GetBlockApiResponseBase & GetBlockApiResponseWithTransactions<TransactionForFullJsonParsed<void>>) | null;
    // transactionDetails=full (default), encoding=jsonParsed, rewards=missing/true, maxSupportedTransactionVersion=0
    getBlock(
        slot: Slot,
        config: GetBlockCommonConfig &
            Readonly<{
                encoding: 'jsonParsed';
                maxSupportedTransactionVersion: GetBlockMaxSupportedTransactionVersion;
                rewards?: boolean;
                transactionDetails?: 'full';
            }>
    ):
        | (GetBlockApiResponseBase &
              GetBlockApiResponseWithRewards &
              GetBlockApiResponseWithTransactions<TransactionForFullJsonParsed<GetBlockMaxSupportedTransactionVersion>>)
        | null;
    // transactionDetails=full (default), encoding=jsonParsed, rewards=missing/true, maxSupportedTransactionVersion=missing
    getBlock(
        slot: Slot,
        config: GetBlockCommonConfig &
            Readonly<{
                encoding: 'jsonParsed';
                rewards?: boolean;
                transactionDetails?: 'full';
            }>
    ):
        | (GetBlockApiResponseBase &
              GetBlockApiResponseWithRewards &
              GetBlockApiResponseWithTransactions<TransactionForFullJsonParsed<void>>)
        | null;
    // transactionDetails=full (default), encoding=json (default), rewards=false, maxSupportedTransactionVersion=0
    getBlock(
        slot: Slot,
        config: GetBlockCommonConfig &
            Readonly<{
                encoding?: 'json';
                maxSupportedTransactionVersion: GetBlockMaxSupportedTransactionVersion;
                rewards: false;
                transactionDetails?: 'full';
            }>
    ):
        | (GetBlockApiResponseBase &
              GetBlockApiResponseWithTransactions<TransactionForFullJson<GetBlockMaxSupportedTransactionVersion>>)
        | null;
    // transactionDetails=full (default), encoding=json (default), rewards=false, maxSupportedTransactionVersion=missing
    getBlock(
        slot: Slot,
        config: GetBlockCommonConfig &
            Readonly<{
                encoding?: 'json';
                rewards: false;
                transactionDetails?: 'full';
            }>
    ): (GetBlockApiResponseBase & GetBlockApiResponseWithTransactions<TransactionForFullJson<void>>) | null;
    // transactionDetails=full (default), encoding=json (default), rewards=missing/true, maxSupportedTransactionVersion=0
    getBlock(
        slot: Slot,
        config: GetBlockCommonConfig &
            Readonly<{
                encoding?: 'json';
                maxSupportedTransactionVersion: GetBlockMaxSupportedTransactionVersion;
                rewards?: boolean;
                transactionDetails?: 'full';
            }>
    ):
        | (GetBlockApiResponseBase &
              GetBlockApiResponseWithRewards &
              GetBlockApiResponseWithTransactions<TransactionForFullJson<GetBlockMaxSupportedTransactionVersion>>)
        | null;
    // transactionDetails=full (default), encoding=json (default), rewards=missing/true, maxSupportedTransactionVersion=missing
    getBlock(
        slot: Slot,
        config?: GetBlockCommonConfig &
            Readonly<{
                encoding?: 'json';
                rewards?: boolean;
                transactionDetails?: 'full';
            }>
    ):
        | (GetBlockApiResponseBase &
              GetBlockApiResponseWithRewards &
              GetBlockApiResponseWithTransactions<TransactionForFullJson<void>>)
        | null;
}
