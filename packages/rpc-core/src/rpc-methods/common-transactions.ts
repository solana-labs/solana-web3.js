import { Address } from '@solana/addresses';
import { LamportsUnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';
import { Blockhash, TransactionVersion } from '@solana/transactions';

import { TransactionError } from '../transaction-error';
import {
    Base58EncodedBytes,
    Base58EncodedDataResponse,
    Base64EncodedDataResponse,
    SignedLamportsAsI64Unsafe,
    TokenBalance,
    U64UnsafeBeyond2Pow53Minus1,
} from './common';

type AddressTableLookup = Readonly<{
    /** public key for an address lookup table account. */
    accountKey: Address;
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
    programId: Address;
}>;

type PartiallyDecodedTransactionInstruction = Readonly<{
    accounts: readonly Address[];
    data: Base58EncodedBytes;
    programId: Address;
}>;

type ReturnData = {
    /** the program that generated the return data */
    programId: Address;
    /** the return data itself */
    data: Base64EncodedDataResponse;
};

type TransactionInstruction = Readonly<{
    accounts: readonly number[];
    data: Base58EncodedBytes;
    programIdIndex: number;
}>;

type TransactionParsedAccountLegacy = Readonly<{
    pubkey: Address;
    signer: boolean;
    source: 'transaction';
    writable: boolean;
}>;
type TransactionParsedAccountVersioned = Readonly<{
    pubkey: Address;
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

export type TransactionForAccounts<TMaxSupportedTransactionVersion extends TransactionVersion | void> =
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
        writable: readonly Address[];
        readonly: readonly Address[];
    };
}>;

type TransactionForFullTransactionAddressTableLookups = Readonly<{
    message: {
        addressTableLookups?: readonly AddressTableLookup[] | null;
    };
}>;

// Base58

export type TransactionForFullBase58<TMaxSupportedTransactionVersion extends TransactionVersion | void> =
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

export type TransactionForFullBase64<TMaxSupportedTransactionVersion extends TransactionVersion | void> =
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

export type TransactionForFullJsonParsed<TMaxSupportedTransactionVersion extends TransactionVersion | void> =
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
        accountKeys: readonly Address[];
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

export type TransactionForFullJson<TMaxSupportedTransactionVersion extends TransactionVersion | void> =
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

type RewardBase = Readonly<{
    /** The public key of the account that received the reward */
    pubkey: Address;
    /** number of reward lamports credited or debited by the account */
    lamports: SignedLamportsAsI64Unsafe;
    /** account balance in lamports after the reward was applied */
    postBalance: LamportsUnsafeBeyond2Pow53Minus1;
}>;

export type Reward =
    | (RewardBase &
          Readonly<{
              /** type of reward */
              rewardType: 'fee' | 'rent';
          }>)
    /** Commission is present only for voting and staking rewards */
    | (RewardBase &
          Readonly<{
              /** type of reward */
              rewardType: 'voting' | 'staking';
              /** vote account commission when the reward was credited */
              commission: number;
          }>);

/** @deprecated */
export type TransactionStatus = { Ok: null } | { Err: TransactionError };
