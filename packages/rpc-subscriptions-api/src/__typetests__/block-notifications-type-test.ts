import type { Address } from '@solana/addresses';
import type { PendingRpcSubscriptionsRequest, RpcSubscriptions } from '@solana/rpc-subscriptions-spec';
import type {
    Base58EncodedBytes,
    Base58EncodedDataResponse,
    Base64EncodedDataResponse,
    Blockhash,
    LamportsUnsafeBeyond2Pow53Minus1,
    Reward,
    Slot,
    SolanaRpcResponse,
    TokenBalance,
    TransactionError,
    TransactionStatus,
    U64UnsafeBeyond2Pow53Minus1,
} from '@solana/rpc-types';
import type { TransactionVersion } from '@solana/transactions';

import type { BlockNotificationsApi } from '../block-notifications';

type BlockNotificationsApiNotificationBase = SolanaRpcResponse<
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
type BlockNotificationsApiNotificationWithRewards = SolanaRpcResponse<
    Readonly<{
        block: {
            rewards: readonly Reward[];
        } | null;
    }>
>;
type BlockNotificationsApiNotificationWithSignatures = SolanaRpcResponse<
    Readonly<{
        block: {
            signatures: readonly Base58EncodedBytes[];
        } | null;
    }>
>;
type BlockNotificationsApiNotificationWithTransactions<TTransactionType> = SolanaRpcResponse<
    Readonly<{
        block: {
            transactions: readonly TTransactionType[];
        } | null;
    }>
>;

const rpcSubscriptions = null as unknown as RpcSubscriptions<BlockNotificationsApi>;

// First overload
// Rewards set to `false`
rpcSubscriptions.blockNotifications('all', {
    // No extra configs
    showRewards: false,
    transactionDetails: 'none',
}) satisfies PendingRpcSubscriptionsRequest<BlockNotificationsApiNotificationBase>;
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
}) satisfies PendingRpcSubscriptionsRequest<
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
}) satisfies PendingRpcSubscriptionsRequest<BlockNotificationsApiNotificationBase>;
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
}) satisfies PendingRpcSubscriptionsRequest<
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
}) satisfies PendingRpcSubscriptionsRequest<
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
}) satisfies PendingRpcSubscriptionsRequest<
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
}) satisfies PendingRpcSubscriptionsRequest<
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
}) satisfies PendingRpcSubscriptionsRequest<
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
}) satisfies PendingRpcSubscriptionsRequest<
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
}) satisfies PendingRpcSubscriptionsRequest<
    BlockNotificationsApiNotificationBase &
        BlockNotificationsApiNotificationWithRewards &
        BlockNotificationsApiNotificationWithSignatures
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
            BlockNotificationsApiNotificationWithRewards &
            BlockNotificationsApiNotificationWithSignatures
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
}) satisfies PendingRpcSubscriptionsRequest<
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
}) satisfies PendingRpcSubscriptionsRequest<
    BlockNotificationsApiNotificationBase &
        BlockNotificationsApiNotificationWithRewards &
        BlockNotificationsApiNotificationWithSignatures
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
            BlockNotificationsApiNotificationWithRewards &
            BlockNotificationsApiNotificationWithSignatures
    >
>;

// Fourth overload
// Rewards defaults to `true`
rpcSubscriptions.blockNotifications('all', {
    // No extra configs
    transactionDetails: 'signatures',
}) satisfies PendingRpcSubscriptionsRequest<
    BlockNotificationsApiNotificationBase &
        BlockNotificationsApiNotificationWithRewards &
        BlockNotificationsApiNotificationWithSignatures
>;
rpcSubscriptions
    .blockNotifications('all', {
        // No extra configs
        transactionDetails: 'signatures',
    })
    .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
    AsyncIterable<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithRewards &
            BlockNotificationsApiNotificationWithSignatures
    >
>;

// Fourth overload with configs
// Rewards defaults to `true`
rpcSubscriptions.blockNotifications('all', {
    commitment: 'confirmed',
    encoding: 'jsonParsed',
    maxSupportedTransactionVersion: 0,
    transactionDetails: 'signatures',
}) satisfies PendingRpcSubscriptionsRequest<
    BlockNotificationsApiNotificationBase &
        BlockNotificationsApiNotificationWithRewards &
        BlockNotificationsApiNotificationWithSignatures
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
            BlockNotificationsApiNotificationWithRewards &
            BlockNotificationsApiNotificationWithSignatures
    >
>;

// // Fourth overload
// // Rewards set to `true`
rpcSubscriptions.blockNotifications('all', {
    // No extra configs
    showRewards: true,
    transactionDetails: 'signatures',
}) satisfies PendingRpcSubscriptionsRequest<
    BlockNotificationsApiNotificationBase &
        BlockNotificationsApiNotificationWithRewards &
        BlockNotificationsApiNotificationWithSignatures
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
            BlockNotificationsApiNotificationWithRewards &
            BlockNotificationsApiNotificationWithSignatures
    >
>;

// Fourth overload with configs
// Rewards set to `true`
rpcSubscriptions.blockNotifications('all', {
    commitment: 'confirmed',
    encoding: 'jsonParsed',
    maxSupportedTransactionVersion: 0,
    transactionDetails: 'signatures',
}) satisfies PendingRpcSubscriptionsRequest<
    BlockNotificationsApiNotificationBase &
        BlockNotificationsApiNotificationWithRewards &
        BlockNotificationsApiNotificationWithSignatures
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
            BlockNotificationsApiNotificationWithRewards &
            BlockNotificationsApiNotificationWithSignatures
    >
>;

type ExpectedMetaForAccountsBase = {
    err: TransactionError | null;
    fee: LamportsUnsafeBeyond2Pow53Minus1;
    postBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
    postTokenBalances?: readonly TokenBalance[];
    preBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
    preTokenBalances?: readonly TokenBalance[];
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
            source: 'lookupTable' | 'transaction';
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
}) satisfies PendingRpcSubscriptionsRequest<
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
}) satisfies PendingRpcSubscriptionsRequest<
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
}) satisfies PendingRpcSubscriptionsRequest<
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
}) satisfies PendingRpcSubscriptionsRequest<
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
}) satisfies PendingRpcSubscriptionsRequest<
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
}) satisfies PendingRpcSubscriptionsRequest<
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
}) satisfies PendingRpcSubscriptionsRequest<
    BlockNotificationsApiNotificationBase &
        BlockNotificationsApiNotificationWithRewards &
        BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForAccountsBaseVersioned>
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
            BlockNotificationsApiNotificationWithRewards &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForAccountsBaseVersioned>
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
}) satisfies PendingRpcSubscriptionsRequest<
    BlockNotificationsApiNotificationBase &
        BlockNotificationsApiNotificationWithRewards &
        BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForAccountsBaseVersioned>
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
            BlockNotificationsApiNotificationWithRewards &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForAccountsBaseVersioned>
    >
>;

// Eighth overload
// Rewards defaults to `true`
// Max supported transaction version defaults to `legacy`
rpcSubscriptions.blockNotifications('all', {
    // No extra configs
    transactionDetails: 'accounts',
}) satisfies PendingRpcSubscriptionsRequest<
    BlockNotificationsApiNotificationBase &
        BlockNotificationsApiNotificationWithRewards &
        BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForAccountsBaseLegacy>
>;
rpcSubscriptions
    .blockNotifications('all', {
        // No extra configs
        transactionDetails: 'accounts',
    })
    .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
    AsyncIterable<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithRewards &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForAccountsBaseLegacy>
    >
>;

// Eighth overload
// Rewards set to `true`
// Max supported transaction version defaults to `legacy`
rpcSubscriptions.blockNotifications('all', {
    // No extra configs
    showRewards: true,
    transactionDetails: 'accounts',
}) satisfies PendingRpcSubscriptionsRequest<
    BlockNotificationsApiNotificationBase &
        BlockNotificationsApiNotificationWithRewards &
        BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForAccountsBaseLegacy>
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
            BlockNotificationsApiNotificationWithRewards &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForAccountsBaseLegacy>
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
    postBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
    postTokenBalances?: readonly TokenBalance[];
    preBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
    preTokenBalances?: readonly TokenBalance[];
    returnData?: Readonly<{
        data: Base64EncodedDataResponse;
        programId: Address;
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
                      readonly: readonly Address[];
                      writable: readonly Address[];
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
}) satisfies PendingRpcSubscriptionsRequest<
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
}) satisfies PendingRpcSubscriptionsRequest<
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
}) satisfies PendingRpcSubscriptionsRequest<
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
}) satisfies PendingRpcSubscriptionsRequest<
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
}) satisfies PendingRpcSubscriptionsRequest<
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
}) satisfies PendingRpcSubscriptionsRequest<
    BlockNotificationsApiNotificationBase &
        BlockNotificationsApiNotificationWithRewards &
        BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase58Versioned>
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
            BlockNotificationsApiNotificationWithRewards &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase58Versioned>
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
}) satisfies PendingRpcSubscriptionsRequest<
    BlockNotificationsApiNotificationBase &
        BlockNotificationsApiNotificationWithRewards &
        BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase58Legacy>
>;
rpcSubscriptions
    .blockNotifications('all', {
        // No extra configs
        encoding: 'base58',
    })
    .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
    AsyncIterable<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithRewards &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase58Legacy>
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
}) satisfies PendingRpcSubscriptionsRequest<
    BlockNotificationsApiNotificationBase &
        BlockNotificationsApiNotificationWithRewards &
        BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase58Legacy>
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
            BlockNotificationsApiNotificationWithRewards &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase58Legacy>
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
    postBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
    postTokenBalances?: readonly TokenBalance[];
    preBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
    preTokenBalances?: readonly TokenBalance[];
    returnData?: Readonly<{
        data: Base64EncodedDataResponse;
        programId: Address;
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
                      readonly: readonly Address[];
                      writable: readonly Address[];
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
}) satisfies PendingRpcSubscriptionsRequest<
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
}) satisfies PendingRpcSubscriptionsRequest<
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
}) satisfies PendingRpcSubscriptionsRequest<
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
}) satisfies PendingRpcSubscriptionsRequest<
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
}) satisfies PendingRpcSubscriptionsRequest<
    BlockNotificationsApiNotificationBase &
        BlockNotificationsApiNotificationWithRewards &
        BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase64Legacy>
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
            BlockNotificationsApiNotificationWithRewards &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase64Legacy>
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
}) satisfies PendingRpcSubscriptionsRequest<
    BlockNotificationsApiNotificationBase &
        BlockNotificationsApiNotificationWithRewards &
        BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase64Legacy>
>;
rpcSubscriptions
    .blockNotifications('all', {
        // No extra configs
        encoding: 'base64',
    })
    .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
    AsyncIterable<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithRewards &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullBase64Legacy>
    >
>;

type ExpectedParsedTransactionInstruction = Readonly<{
    parsed: {
        info?: object;
        type: string;
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
    postBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
    postTokenBalances?: readonly TokenBalance[];
    preBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
    preTokenBalances?: readonly TokenBalance[];
    returnData?: Readonly<{
        data: Base64EncodedDataResponse;
        programId: Address;
    }>;
    rewards: readonly Reward[] | null;
    status: TransactionStatus;
};

type ExpectedMetaForFullJsonParsedLoadedAddresses = Readonly<{
    loadedAddresses: {
        readonly: readonly Address[];
        writable: readonly Address[];
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
}) satisfies PendingRpcSubscriptionsRequest<
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
}) satisfies PendingRpcSubscriptionsRequest<
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
}) satisfies PendingRpcSubscriptionsRequest<
    BlockNotificationsApiNotificationBase &
        BlockNotificationsApiNotificationWithRewards &
        BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullJsonParsedVersioned>
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
            BlockNotificationsApiNotificationWithRewards &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullJsonParsedVersioned>
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
}) satisfies PendingRpcSubscriptionsRequest<
    BlockNotificationsApiNotificationBase &
        BlockNotificationsApiNotificationWithRewards &
        BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullJsonParsedLegacy>
>;
rpcSubscriptions
    .blockNotifications('all', {
        // No extra configs
        encoding: 'jsonParsed',
    })
    .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
    AsyncIterable<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithRewards &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullJsonParsedLegacy>
    >
>;

type ExpectedTransactionInstructionForFullJson = {
    accounts: readonly number[];
    data: Base58EncodedBytes;
    programIdIndex: number;
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
    postBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
    postTokenBalances?: readonly TokenBalance[];
    preBalances: readonly LamportsUnsafeBeyond2Pow53Minus1[];
    preTokenBalances?: readonly TokenBalance[];
    returnData?: Readonly<{
        data: Base64EncodedDataResponse;
        programId: Address;
    }>;
    rewards: readonly Reward[] | null;
    status: TransactionStatus;
};

type ExpectedMetaForFullJsonLoadedAddresses = Readonly<{
    loadedAddresses: {
        readonly: readonly Address[];
        writable: readonly Address[];
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
}) satisfies PendingRpcSubscriptionsRequest<
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
}) satisfies PendingRpcSubscriptionsRequest<
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
}) satisfies PendingRpcSubscriptionsRequest<
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
}) satisfies PendingRpcSubscriptionsRequest<
    BlockNotificationsApiNotificationBase &
        BlockNotificationsApiNotificationWithRewards &
        BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullJsonLegacy>
>;
rpcSubscriptions
    .blockNotifications('all', {
        // No extra configs
        maxSupportedTransactionVersion: 0,
    })
    .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
    AsyncIterable<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithRewards &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullJsonLegacy>
    >
>;

// Twenty-fourth overload
// Rewards defaults to `true`
// Max supported transaction defaults to `legacy`
// Encoding defaults to `json`
// Transaction details defaults to `full`
rpcSubscriptions.blockNotifications('all') satisfies PendingRpcSubscriptionsRequest<
    BlockNotificationsApiNotificationBase &
        BlockNotificationsApiNotificationWithRewards &
        BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullJsonLegacy>
>;
rpcSubscriptions.blockNotifications('all').subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
    AsyncIterable<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithRewards &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullJsonLegacy>
    >
>;

// Twenty-fourth overload with configs
rpcSubscriptions.blockNotifications('all', { commitment: 'confirmed' }) satisfies PendingRpcSubscriptionsRequest<
    BlockNotificationsApiNotificationBase &
        BlockNotificationsApiNotificationWithRewards &
        BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullJsonLegacy>
>;
rpcSubscriptions
    .blockNotifications('all', { commitment: 'confirmed' })
    .subscribe({ abortSignal: new AbortController().signal }) satisfies Promise<
    AsyncIterable<
        BlockNotificationsApiNotificationBase &
            BlockNotificationsApiNotificationWithRewards &
            BlockNotificationsApiNotificationWithTransactions<ExpectedTransactionForFullJsonLegacy>
    >
>;
