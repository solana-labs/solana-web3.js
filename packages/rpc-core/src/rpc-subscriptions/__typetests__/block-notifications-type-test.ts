import { Address } from '@solana/addresses';
import { PendingRpcSubscription, RpcSubscriptions } from '@solana/rpc-transport/dist/types/json-rpc-types';
import { LamportsUnsafeBeyond2Pow53Minus1 } from '@solana/rpc-types';
import { Blockhash, TransactionVersion } from '@solana/transactions';

import { RpcResponse, Slot } from '../../rpc-methods/common';
import {
    Base58EncodedBytes,
    Base58EncodedDataResponse,
    Base64EncodedDataResponse,
    TokenBalance,
    U64UnsafeBeyond2Pow53Minus1,
} from '../../rpc-methods/common';
import { Reward, TransactionStatus } from '../../rpc-methods/common-transactions';
import { TransactionError } from '../../transaction-error';
import { SolanaRpcSubscriptions } from '../index';

async () => {
    type BlockNotificationsApiNotificationBase = RpcResponse<
        Readonly<{
            block: {
                blockHeight: bigint;
                blockTime: number;
                blockhash: string;
                parentSlot: bigint;
                previousBlockhash: string;
            } | null;
            err: string | null;
            slot: Slot;
        }>
    >;
    type BlockNotificationsApiNotificationWithRewards = RpcResponse<
        Readonly<{
            block: {
                rewards: readonly Reward[];
            } | null;
        }>
    >;
    type BlockNotificationsApiNotificationWithSignatures = RpcResponse<
        Readonly<{
            block: {
                signatures: readonly Base58EncodedBytes[];
            } | null;
        }>
    >;
    type BlockNotificationsApiNotificationWithTransactions<TTransactionType> = RpcResponse<
        Readonly<{
            block: {
                transactions: readonly TTransactionType[];
            } | null;
        }>
    >;

    const rpcSubscriptions = null as unknown as RpcSubscriptions<SolanaRpcSubscriptions>;

    // First overload
    // Rewards set to `false`
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        showRewards: false,
        transactionDetails: 'none',
    }) satisfies PendingRpcSubscription<BlockNotificationsApiNotificationBase>;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            showRewards: false,
            transactionDetails: 'none',
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<BlockNotificationsApiNotificationBase>
    >;
    // No rewards
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        showRewards: false,
        transactionDetails: 'none',
        // @ts-expect-error no rewards
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase & BlockNotificationsApiNotificationWithRewards
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            showRewards: false,
            transactionDetails: 'none',
        })
        // @ts-expect-error no rewards
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<BlockNotificationsApiNotificationBase & BlockNotificationsApiNotificationWithRewards>
    >;

    // First overload with configs
    // Rewards set to `false`
    rpcSubscriptions.blockNotifications('all', {
        commitment: 'processed',
        encoding: 'base64',
        maxSupportedTransactionVersion: 0,
        showRewards: false,
        transactionDetails: 'none',
    }) satisfies PendingRpcSubscription<BlockNotificationsApiNotificationBase>;
    rpcSubscriptions
        .blockNotifications('all', {
            commitment: 'processed',
            encoding: 'base64',
            maxSupportedTransactionVersion: 0,
            showRewards: false,
            transactionDetails: 'none',
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<BlockNotificationsApiNotificationBase>
    >;
    // No rewards
    rpcSubscriptions.blockNotifications('all', {
        commitment: 'processed',
        encoding: 'base64',
        maxSupportedTransactionVersion: 0,
        showRewards: false,
        transactionDetails: 'none',
        // @ts-expect-error no rewards
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase & BlockNotificationsApiNotificationWithRewards
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            commitment: 'processed',
            encoding: 'base64',
            maxSupportedTransactionVersion: 0,
            showRewards: false,
            transactionDetails: 'none',
        })
        // @ts-expect-error no rewards
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<BlockNotificationsApiNotificationBase & BlockNotificationsApiNotificationWithRewards>
    >;

    // Second overload
    // Rewards defaults to `true`
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        transactionDetails: 'none',
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase & BlockNotificationsApiNotificationWithRewards
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            transactionDetails: 'none',
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<BlockNotificationsApiNotificationBase & BlockNotificationsApiNotificationWithRewards>
    >;

    // Second overload with configs
    // Rewards defaults to `true`
    rpcSubscriptions.blockNotifications('all', {
        commitment: 'confirmed',
        encoding: 'base58',
        maxSupportedTransactionVersion: 0,
        transactionDetails: 'none',
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase & BlockNotificationsApiNotificationWithRewards
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            commitment: 'confirmed',
            encoding: 'base58',
            maxSupportedTransactionVersion: 0,
            transactionDetails: 'none',
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<BlockNotificationsApiNotificationBase & BlockNotificationsApiNotificationWithRewards>
    >;

    // Second overload
    // Rewards set to `true`
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        showRewards: true,
        transactionDetails: 'none',
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase & BlockNotificationsApiNotificationWithRewards
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            showRewards: true,
            transactionDetails: 'none',
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<BlockNotificationsApiNotificationBase & BlockNotificationsApiNotificationWithRewards>
    >;

    // Second overload with configs
    // Rewards set to `true`
    rpcSubscriptions.blockNotifications('all', {
        commitment: 'confirmed',
        encoding: 'base58',
        maxSupportedTransactionVersion: 0,
        showRewards: true,
        transactionDetails: 'none',
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase & BlockNotificationsApiNotificationWithRewards
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            commitment: 'confirmed',
            encoding: 'base58',
            maxSupportedTransactionVersion: 0,
            showRewards: true,
            transactionDetails: 'none',
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<BlockNotificationsApiNotificationBase & BlockNotificationsApiNotificationWithRewards>
    >;

    // Third overload
    // Rewards set to `false`
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        showRewards: false,
        transactionDetails: 'signatures',
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase & BlockNotificationsApiNotificationWithSignatures
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            showRewards: false,
            transactionDetails: 'signatures',
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<BlockNotificationsApiNotificationBase & BlockNotificationsApiNotificationWithSignatures>
    >;
    // No rewards
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        showRewards: false,
        transactionDetails: 'signatures',
        // @ts-expect-error no rewards
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithSignatures &
            BlockNotificationsApiNotificationWithRewards
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            showRewards: false,
            transactionDetails: 'signatures',
        })
        // @ts-expect-error no rewards
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithSignatures &
                BlockNotificationsApiNotificationWithRewards
        >
    >;

    // Third overload with configs
    // Rewards set to `false`
    rpcSubscriptions.blockNotifications('all', {
        commitment: 'confirmed',
        encoding: 'json',
        maxSupportedTransactionVersion: 0,
        showRewards: false,
        transactionDetails: 'signatures',
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase & BlockNotificationsApiNotificationWithSignatures
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            commitment: 'confirmed',
            encoding: 'json',
            maxSupportedTransactionVersion: 0,
            showRewards: false,
            transactionDetails: 'signatures',
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<BlockNotificationsApiNotificationBase & BlockNotificationsApiNotificationWithSignatures>
    >;
    // No rewards
    rpcSubscriptions.blockNotifications('all', {
        commitment: 'confirmed',
        encoding: 'json',
        maxSupportedTransactionVersion: 0,
        showRewards: false,
        transactionDetails: 'signatures',
        // @ts-expect-error no rewards
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithSignatures &
            BlockNotificationsApiNotificationWithRewards
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            commitment: 'confirmed',
            encoding: 'json',
            maxSupportedTransactionVersion: 0,
            showRewards: false,
            transactionDetails: 'signatures',
        })
        // @ts-expect-error no rewards
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithSignatures &
                BlockNotificationsApiNotificationWithRewards
        >
    >;

    // Fourth overload
    // Rewards defaults to `true`
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        transactionDetails: 'signatures',
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithSignatures &
            BlockNotificationsApiNotificationWithRewards
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            transactionDetails: 'signatures',
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithSignatures &
                BlockNotificationsApiNotificationWithRewards
        >
    >;

    // Fourth overload with configs
    // Rewards defaults to `true`
    rpcSubscriptions.blockNotifications('all', {
        commitment: 'confirmed',
        encoding: 'jsonParsed',
        maxSupportedTransactionVersion: 0,
        transactionDetails: 'signatures',
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithSignatures &
            BlockNotificationsApiNotificationWithRewards
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            commitment: 'confirmed',
            encoding: 'jsonParsed',
            maxSupportedTransactionVersion: 0,
            transactionDetails: 'signatures',
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithSignatures &
                BlockNotificationsApiNotificationWithRewards
        >
    >;

    // // Fourth overload
    // // Rewards set to `true`
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        showRewards: true,
        transactionDetails: 'signatures',
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithSignatures &
            BlockNotificationsApiNotificationWithRewards
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            showRewards: true,
            transactionDetails: 'signatures',
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithSignatures &
                BlockNotificationsApiNotificationWithRewards
        >
    >;

    // Fourth overload with configs
    // Rewards set to `true`
    rpcSubscriptions.blockNotifications('all', {
        commitment: 'confirmed',
        encoding: 'jsonParsed',
        maxSupportedTransactionVersion: 0,
        transactionDetails: 'signatures',
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithSignatures &
            BlockNotificationsApiNotificationWithRewards
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            commitment: 'confirmed',
            encoding: 'jsonParsed',
            maxSupportedTransactionVersion: 0,
            transactionDetails: 'signatures',
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithSignatures &
                BlockNotificationsApiNotificationWithRewards
        >
    >;

    type ExpectedMetaForAccountsBase = {
        err: TransactionError | null;
        fee: LamportsUnsafeBeyond2Pow53Minus1;
        preBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
        postBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
        preTokenBalances?: readonly TokenBalance[];
        postTokenBalances?: readonly TokenBalance[];
        status: TransactionStatus;
    };

    type ExpectedTransactionForAccountsBaseLegacy = {
        meta: ExpectedMetaForAccountsBase | null;
        transaction: {
            accountKeys: readonly Readonly<{
                pubkey: string;
                signer: boolean;
                source: 'transaction';
                writable: boolean;
            }>[];
            signatures: readonly Base58EncodedBytes[];
        };
    };

    type ExpectedTransactionForAccountsBaseVersioned = {
        meta: ExpectedMetaForAccountsBase | null;
        transaction: {
            accountKeys: readonly Readonly<{
                pubkey: string;
                signer: boolean;
                source: 'transaction' | 'lookupTable';
                writable: boolean;
            }>[];
            signatures: readonly Base58EncodedBytes[];
        };
        version: TransactionVersion;
    };

    // Fifth overload
    // Rewards set to `false`
    // Max supported transaction version set to 0
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        maxSupportedTransactionVersion: 0,
        showRewards: false,
        transactionDetails: 'accounts',
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForAccountsBaseVersioned>
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            maxSupportedTransactionVersion: 0,
            showRewards: false,
            transactionDetails: 'accounts',
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForAccountsBaseVersioned>
        >
    >;

    // Fifth overload with configs
    // Rewards set to `false`
    // Max supported transaction version set to 0
    rpcSubscriptions.blockNotifications('all', {
        commitment: 'confirmed',
        encoding: 'base64',
        maxSupportedTransactionVersion: 0,
        showRewards: false,
        transactionDetails: 'accounts',
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForAccountsBaseVersioned>
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            commitment: 'confirmed',
            encoding: 'base64',
            maxSupportedTransactionVersion: 0,
            showRewards: false,
            transactionDetails: 'accounts',
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForAccountsBaseVersioned>
        >
    >;

    // Sixth overload
    // Rewards set to `false`
    // Max supported transaction version defaults to `legacy`
    rpcSubscriptions.blockNotifications('all', {
        commitment: 'confirmed',
        encoding: 'base64',
        showRewards: false,
        transactionDetails: 'accounts',
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForAccountsBaseLegacy>
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            commitment: 'confirmed',
            encoding: 'base64',
            showRewards: false,
            transactionDetails: 'accounts',
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForAccountsBaseLegacy>
        >
    >;

    // Sixth overload with configs
    // Rewards set to `false`
    // Max supported transaction version defaults to `legacy`
    rpcSubscriptions.blockNotifications('all', {
        commitment: 'confirmed',
        encoding: 'base64',
        showRewards: false,
        transactionDetails: 'accounts',
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForAccountsBaseLegacy>
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            commitment: 'confirmed',
            encoding: 'base64',
            showRewards: false,
            transactionDetails: 'accounts',
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForAccountsBaseLegacy>
        >
    >;

    // Seventh overload
    // Rewards defaults to `true`
    // Max supported transaction version set to 0
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        maxSupportedTransactionVersion: 0,
        transactionDetails: 'accounts',
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForAccountsBaseVersioned>
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            maxSupportedTransactionVersion: 0,
            transactionDetails: 'accounts',
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForAccountsBaseVersioned>
        >
    >;

    // Seventh overload with configs
    // Rewards defaults to `true`
    // Max supported transaction version set to 0
    rpcSubscriptions.blockNotifications('all', {
        commitment: 'confirmed',
        encoding: 'base64',
        maxSupportedTransactionVersion: 0,
        transactionDetails: 'accounts',
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForAccountsBaseVersioned>
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            commitment: 'confirmed',
            encoding: 'base64',
            maxSupportedTransactionVersion: 0,
            transactionDetails: 'accounts',
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForAccountsBaseVersioned>
        >
    >;

    // Seventh overload
    // Rewards set to `true`
    // Max supported transaction version set to 0
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        maxSupportedTransactionVersion: 0,
        showRewards: true,
        transactionDetails: 'accounts',
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForAccountsBaseVersioned> &
            BlockNotificationsApiNotificationWithRewards
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            maxSupportedTransactionVersion: 0,
            showRewards: true,
            transactionDetails: 'accounts',
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForAccountsBaseVersioned> &
                BlockNotificationsApiNotificationWithRewards
        >
    >;

    // Seventh overload with configs
    // Rewards set to `true`
    // Max supported transaction version set to 0
    rpcSubscriptions.blockNotifications('all', {
        commitment: 'confirmed',
        encoding: 'base64',
        maxSupportedTransactionVersion: 0,
        showRewards: true,
        transactionDetails: 'accounts',
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForAccountsBaseVersioned> &
            BlockNotificationsApiNotificationWithRewards
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            commitment: 'confirmed',
            encoding: 'base64',
            maxSupportedTransactionVersion: 0,
            showRewards: true,
            transactionDetails: 'accounts',
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForAccountsBaseVersioned> &
                BlockNotificationsApiNotificationWithRewards
        >
    >;

    // Eighth overload
    // Rewards defaults to `true`
    // Max supported transaction version defaults to `legacy`
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        transactionDetails: 'accounts',
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForAccountsBaseLegacy> &
            BlockNotificationsApiNotificationWithRewards
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            transactionDetails: 'accounts',
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForAccountsBaseLegacy> &
                BlockNotificationsApiNotificationWithRewards
        >
    >;

    // Eighth overload
    // Rewards set to `true`
    // Max supported transaction version defaults to `legacy`
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        showRewards: true,
        transactionDetails: 'accounts',
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForAccountsBaseLegacy> &
            BlockNotificationsApiNotificationWithRewards
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            showRewards: true,
            transactionDetails: 'accounts',
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForAccountsBaseLegacy> &
                BlockNotificationsApiNotificationWithRewards
        >
    >;

    type ExpectedMetaForFullBase58 = {
        computeUnitsConsumed?: U64UnsafeBeyond2Pow53Minus1;
        err: TransactionError | null;
        fee: LamportsUnsafeBeyond2Pow53Minus1;
        innerInstructions: readonly Readonly<{
            index: number;
            instructions: readonly Readonly<{
                accounts: readonly number[];
                data: Base58EncodedBytes;
                programIdIndex: number;
            }>[];
        }>[];
        logMessages: readonly string[] | null;
        preBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
        postBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
        preTokenBalances?: readonly TokenBalance[];
        postTokenBalances?: readonly TokenBalance[];
        returnData?: Readonly<{
            programId: Address;
            data: Base64EncodedDataResponse;
        }>;
        rewards: readonly Reward[] | null;
        status: TransactionStatus;
    };

    type ExpectedTransactionForFullBase58Legacy = {
        meta: ExpectedMetaForFullBase58 | null;
        transaction: Base58EncodedDataResponse;
    };

    type ExpectedTransactionForFullBase58Versioned = {
        meta:
            | (ExpectedMetaForFullBase58 &
                  Readonly<{
                      loadedAddresses: {
                          writable: readonly Address[];
                          readonly: readonly Address[];
                      };
                  }>)
            | null;
        transaction: Base58EncodedDataResponse;
        version: TransactionVersion;
    };

    // Ninth overload
    // Rewards set to `false`
    // Max supported transaction version set to 0
    // Encoding set to `base58`
    // Transaction details default to `full`
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        encoding: 'base58',
        maxSupportedTransactionVersion: 0,
        showRewards: false,
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase58Versioned>
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            encoding: 'base58',
            maxSupportedTransactionVersion: 0,
            showRewards: false,
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase58Versioned>
        >
    >;

    // Ninth overload
    // Rewards set to `false`
    // Max supported transaction version set to 0
    // Encoding set to `base58`
    // Transaction details set to `full`
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        encoding: 'base58',
        maxSupportedTransactionVersion: 0,
        showRewards: false,
        transactionDetails: 'full',
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase58Versioned>
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            encoding: 'base58',
            maxSupportedTransactionVersion: 0,
            showRewards: false,
            transactionDetails: 'full',
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase58Versioned>
        >
    >;

    // Tenth overload
    // Rewards set to `false`
    // Max supported transaction defaults to `legacy`
    // Encoding set to `base58`
    // Transaction details defaults to `full`
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        encoding: 'base58',
        showRewards: false,
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase58Legacy>
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            encoding: 'base58',
            showRewards: false,
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase58Legacy>
        >
    >;

    // Tenth overload
    // Rewards set to `false`
    // Max supported transaction defaults to `legacy`
    // Encoding set to `base58`
    // Transaction details set to `full`
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        encoding: 'base58',
        showRewards: false,
        transactionDetails: 'full',
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase58Legacy>
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            encoding: 'base58',
            showRewards: false,
            transactionDetails: 'full',
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase58Legacy>
        >
    >;

    // Eleventh overload
    // Rewards defaults to `true`
    // Max supported transaction version set to 0
    // Encoding set to `base58`
    // Transaction details defaults to `full`
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        encoding: 'base58',
        maxSupportedTransactionVersion: 0,
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase58Versioned>
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            encoding: 'base58',
            maxSupportedTransactionVersion: 0,
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase58Versioned>
        >
    >;

    // Eleventh overload
    // Rewards set to `true`
    // Max supported transaction version set to 0
    // Encoding set to `base58`
    // Transaction details defaults to `full`
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        encoding: 'base58',
        maxSupportedTransactionVersion: 0,
        showRewards: true,
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase58Versioned> &
            BlockNotificationsApiNotificationWithRewards
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            encoding: 'base58',
            maxSupportedTransactionVersion: 0,
            showRewards: true,
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase58Versioned> &
                BlockNotificationsApiNotificationWithRewards
        >
    >;

    // Twelfth overload
    // Rewards defaults to `true`
    // Max supported transaction defaults to `legacy`
    // Encoding set to `base58`
    // Transaction details defaults to `full`
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        encoding: 'base58',
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase58Legacy> &
            BlockNotificationsApiNotificationWithRewards
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            encoding: 'base58',
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase58Legacy> &
                BlockNotificationsApiNotificationWithRewards
        >
    >;

    // Twelfth overload
    // Rewards set to `true`
    // Max supported transaction defaults to `legacy`
    // Encoding set to `base58`
    // Transaction details defaults to `full`
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        encoding: 'base58',
        showRewards: true,
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase58Legacy> &
            BlockNotificationsApiNotificationWithRewards
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            encoding: 'base58',
            showRewards: true,
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase58Legacy> &
                BlockNotificationsApiNotificationWithRewards
        >
    >;

    type ExpectedMetaForFullBase64 = {
        computeUnitsConsumed?: U64UnsafeBeyond2Pow53Minus1;
        err: TransactionError | null;
        fee: LamportsUnsafeBeyond2Pow53Minus1;
        innerInstructions: readonly Readonly<{
            index: number;
            instructions: readonly Readonly<{
                accounts: readonly number[];
                data: Base58EncodedBytes;
                programIdIndex: number;
            }>[];
        }>[];
        logMessages: readonly string[] | null;
        preBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
        postBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
        preTokenBalances?: readonly TokenBalance[];
        postTokenBalances?: readonly TokenBalance[];
        returnData?: Readonly<{
            programId: Address;
            data: Base64EncodedDataResponse;
        }>;
        rewards: readonly Reward[] | null;
        status: TransactionStatus;
    };

    type ExpectedTransactionForFullBase64Legacy = {
        meta: ExpectedMetaForFullBase64 | null;
        transaction: Base64EncodedDataResponse;
    };

    type ExpectedTransactionForFullBase64Versioned = {
        meta:
            | (ExpectedMetaForFullBase64 &
                  Readonly<{
                      loadedAddresses: {
                          writable: readonly Address[];
                          readonly: readonly Address[];
                      };
                  }>)
            | null;
        transaction: Base64EncodedDataResponse;
        version: TransactionVersion;
    };

    // Thirteenth overload
    // Rewards set to `false`
    // Max supported transaction version set to 0
    // Encoding set to `base64`
    // Transaction details default to `full`
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        encoding: 'base64',
        maxSupportedTransactionVersion: 0,
        showRewards: false,
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase64Versioned>
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            encoding: 'base64',
            maxSupportedTransactionVersion: 0,
            showRewards: false,
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase64Versioned>
        >
    >;

    // Thirteenth overload
    // Rewards set to `false`
    // Max supported transaction version set to 0
    // Encoding set to `base64`
    // Transaction details set to `full`
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        encoding: 'base64',
        maxSupportedTransactionVersion: 0,
        showRewards: false,
        transactionDetails: 'full',
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase64Versioned>
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            encoding: 'base64',
            maxSupportedTransactionVersion: 0,
            showRewards: false,
            transactionDetails: 'full',
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase64Versioned>
        >
    >;

    // Fourteenth overload
    // Rewards set to `false`
    // Max supported transaction defaults to `legacy`
    // Encoding set to `base64`
    // Transaction details defaults to `full`
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        encoding: 'base64',
        showRewards: false,
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase64Legacy>
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            encoding: 'base64',
            showRewards: false,
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase64Legacy>
        >
    >;

    // Fourteenth overload
    // Rewards set to `false`
    // Max supported transaction defaults to `legacy`
    // Encoding set to `base64`
    // Transaction details set to `full`
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        encoding: 'base64',
        showRewards: false,
        transactionDetails: 'full',
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase64Legacy>
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            encoding: 'base64',
            showRewards: false,
            transactionDetails: 'full',
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase64Legacy>
        >
    >;

    // Fifteenth overload
    // Rewards defaults to `true`
    // Max supported transaction version set to 0
    // Encoding set to `base64`
    // Transaction details defaults to `full`
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        encoding: 'base64',
        maxSupportedTransactionVersion: 0,
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase64Legacy> &
            BlockNotificationsApiNotificationWithRewards
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            encoding: 'base64',
            maxSupportedTransactionVersion: 0,
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase64Legacy> &
                BlockNotificationsApiNotificationWithRewards
        >
    >;

    // // Sixteenth overload
    // // Rewards defaults to `true`
    // // Max supported transaction defaults to `legacy`
    // // Encoding set to `base64`
    // // Transaction details defaults to `full`
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        encoding: 'base64',
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase64Legacy> &
            BlockNotificationsApiNotificationWithRewards
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            encoding: 'base64',
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase64Legacy> &
                BlockNotificationsApiNotificationWithRewards
        >
    >;

    type ExpectedParsedTransactionInstruction = Readonly<{
        parsed: {
            type: string;
            info?: object;
        };
        program: string;
        programId: Address;
    }>;

    type ExpectedPartiallyDecodedTransactionInstruction = Readonly<{
        accounts: readonly Address[];
        data: Base58EncodedBytes;
        programId: Address;
    }>;

    type ExpectedTransactionInstructionForFullJsonParsed =
        | ExpectedParsedTransactionInstruction
        | ExpectedPartiallyDecodedTransactionInstruction;

    type ExpectedMetaForFullJsonParsedBase = {
        computeUnitsConsumed?: U64UnsafeBeyond2Pow53Minus1;
        err: TransactionError | null;
        fee: LamportsUnsafeBeyond2Pow53Minus1;
        innerInstructions: readonly Readonly<{
            index: number;
            instructions: readonly ExpectedTransactionInstructionForFullJsonParsed[];
        }>[];
        logMessages: readonly string[] | null;
        preBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
        postBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
        preTokenBalances?: readonly TokenBalance[];
        postTokenBalances?: readonly TokenBalance[];
        returnData?: Readonly<{
            programId: Address;
            data: Base64EncodedDataResponse;
        }>;
        rewards: readonly Reward[] | null;
        status: TransactionStatus;
    };

    type ExpectedMetaForFullJsonParsedLoadedAddresses = Readonly<{
        loadedAddresses: {
            writable: readonly Address[];
            readonly: readonly Address[];
        };
    }>;

    type ExpectedTransactionForFullJsonParsedBase = {
        message: {
            header: {
                numReadonlySignedAccounts: number;
                numReadonlyUnsignedAccounts: number;
                numRequiredSignatures: number;
            };
            instructions: readonly ExpectedTransactionInstructionForFullJsonParsed[];
            recentBlockhash: Blockhash;
        };
        signatures: readonly Base58EncodedBytes[];
    };

    type ExpectedTransactionForFullJsonParsedLegacy = {
        meta: ExpectedMetaForFullJsonParsedBase | null;
        transaction: ExpectedTransactionForFullJsonParsedBase & {
            message: Readonly<{
                accountKeys: readonly Readonly<{
                    pubkey: string;
                    signer: boolean;
                    source: 'transaction';
                    writable: boolean;
                }>[];
            }>;
        };
    };

    type ExpectedTransactionForFullJsonParsedVersioned = {
        meta: (ExpectedMetaForFullJsonParsedBase & ExpectedMetaForFullJsonParsedLoadedAddresses) | null;
        transaction: ExpectedTransactionForFullJsonParsedBase & {
            message: Readonly<{
                accountKeys: readonly Readonly<{
                    pubkey: string;
                    signer: boolean;
                    source: 'lookupTable' | 'transaction';
                    writable: boolean;
                }>[];
            }>;
        };
        version: TransactionVersion;
    };

    // Seventeenth overload
    // Rewards set to `false`
    // Max supported transaction version set to 0
    // Encoding set to `jsonParsed`
    // Transaction details default to `full`
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        encoding: 'jsonParsed',
        maxSupportedTransactionVersion: 0,
        showRewards: false,
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullJsonParsedVersioned>
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            encoding: 'jsonParsed',
            maxSupportedTransactionVersion: 0,
            showRewards: false,
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullJsonParsedVersioned>
        >
    >;

    // Eighteenth overload
    // Rewards set to `false`
    // Max supported transaction defaults to `legacy`
    // Encoding set to `jsonParsed`
    // Transaction details defaults to `full`
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        encoding: 'jsonParsed',
        showRewards: false,
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullJsonParsedLegacy>
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            encoding: 'jsonParsed',
            showRewards: false,
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullJsonParsedLegacy>
        >
    >;

    // Nineteenth overload
    // Rewards defaults to `true`
    // Max supported transaction version set to 0
    // Encoding set to `jsonParsed`
    // Transaction details defaults to `full`
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        encoding: 'jsonParsed',
        maxSupportedTransactionVersion: 0,
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullJsonParsedVersioned> &
            BlockNotificationsApiNotificationWithRewards
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            encoding: 'jsonParsed',
            maxSupportedTransactionVersion: 0,
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullJsonParsedVersioned> &
                BlockNotificationsApiNotificationWithRewards
        >
    >;

    // Twentieth overload
    // Rewards defaults to `true`
    // Max supported transaction defaults to `legacy`
    // Encoding set to `jsonParsed`
    // Transaction details defaults to `full`
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        encoding: 'jsonParsed',
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullJsonParsedLegacy> &
            BlockNotificationsApiNotificationWithRewards
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            encoding: 'jsonParsed',
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullJsonParsedLegacy> &
                BlockNotificationsApiNotificationWithRewards
        >
    >;

    type ExpectedTransactionInstructionForFullJson = {
        programIdIndex: number;
        accounts: readonly number[];
        data: Base58EncodedBytes;
    };

    type ExpectedMetaForFullJsonBase = {
        computeUnitsConsumed?: U64UnsafeBeyond2Pow53Minus1;
        err: TransactionError | null;
        fee: LamportsUnsafeBeyond2Pow53Minus1;
        innerInstructions: readonly Readonly<{
            index: number;
            instructions: readonly ExpectedTransactionInstructionForFullJson[];
        }>[];
        logMessages: readonly string[] | null;
        preBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
        postBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
        preTokenBalances?: readonly TokenBalance[];
        postTokenBalances?: readonly TokenBalance[];
        returnData?: Readonly<{
            programId: Address;
            data: Base64EncodedDataResponse;
        }>;
        rewards: readonly Reward[] | null;
        status: TransactionStatus;
    };

    type ExpectedMetaForFullJsonLoadedAddresses = Readonly<{
        loadedAddresses: {
            writable: readonly Address[];
            readonly: readonly Address[];
        };
    }>;

    type ExpectedTransactionForFullJsonBase = {
        message: {
            accountKeys: readonly Address[];
            header: {
                numReadonlySignedAccounts: number;
                numReadonlyUnsignedAccounts: number;
                numRequiredSignatures: number;
            };
            instructions: readonly ExpectedTransactionInstructionForFullJson[];
            recentBlockhash: Blockhash;
        };
        signatures: readonly Base58EncodedBytes[];
    };

    type ExpectedTransactionForFullJsonLegacy = {
        meta: ExpectedMetaForFullJsonBase | null;
        transaction: ExpectedTransactionForFullJsonBase;
    };

    type ExpectedTransactionForFullJsonVersioned = {
        meta: (ExpectedMetaForFullJsonBase & ExpectedMetaForFullJsonLoadedAddresses) | null;
        transaction: ExpectedTransactionForFullJsonBase;
        version: TransactionVersion;
    };

    // Twenty-first overload
    // Rewards set to `false`
    // Max supported transaction version set to 0
    // Encoding defaults to `json`
    // Transaction details default to `full`
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        maxSupportedTransactionVersion: 0,
        showRewards: false,
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullJsonVersioned>
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            maxSupportedTransactionVersion: 0,
            showRewards: false,
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullJsonVersioned>
        >
    >;

    // Twenty-first overload
    // Rewards set to `false`
    // Max supported transaction version set to 0
    // Encoding set to `json`
    // Transaction details defaults to `full`
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        encoding: 'json',
        maxSupportedTransactionVersion: 0,
        showRewards: false,
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullJsonVersioned>
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            encoding: 'json',
            maxSupportedTransactionVersion: 0,
            showRewards: false,
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullJsonVersioned>
        >
    >;

    // Twenty-second overload
    // Rewards set to `false`
    // Max supported transaction defaults to `legacy`
    // Encoding defaults to `json`
    // Transaction details defaults to `full`
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        showRewards: false,
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullJsonLegacy>
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            showRewards: false,
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullJsonLegacy>
        >
    >;

    // Twenty-third overload
    // Rewards defaults to `true`
    // Max supported transaction version set to 0
    // Encoding defaults to `json`
    // Transaction details defaults to `full`
    rpcSubscriptions.blockNotifications('all', {
        // No extra configs
        maxSupportedTransactionVersion: 0,
    }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullJsonLegacy> &
            BlockNotificationsApiNotificationWithRewards
    >;
    rpcSubscriptions
        .blockNotifications('all', {
            // No extra configs
            maxSupportedTransactionVersion: 0,
        })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullJsonLegacy> &
                BlockNotificationsApiNotificationWithRewards
        >
    >;

    // Twenty-fourth overload
    // Rewards defaults to `true`
    // Max supported transaction defaults to `legacy`
    // Encoding defaults to `json`
    // Transaction details defaults to `full`
    rpcSubscriptions.blockNotifications('all') satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullJsonLegacy> &
            BlockNotificationsApiNotificationWithRewards
    >;
    rpcSubscriptions
        .blockNotifications('all')
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullJsonLegacy> &
                BlockNotificationsApiNotificationWithRewards
        >
    >;

    // Twenty-fourth overload with configs
    rpcSubscriptions.blockNotifications('all', { commitment: 'confirmed' }) satisfies PendingRpcSubscription<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullJsonLegacy> &
            BlockNotificationsApiNotificationWithRewards
    >;
    rpcSubscriptions
        .blockNotifications('all', { commitment: 'confirmed' })
        .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
        AsyncIterable<
            BlockNotificationsApiNotificationBase &
                BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullJsonLegacy> &
                BlockNotificationsApiNotificationWithRewards
        >
    >;
};
