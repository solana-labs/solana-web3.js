import type { RpcSubscriptionsApiMethods } from '@solana/rpc-subscriptions-spec';
import type {
    Base58EncodedBytes,
    Blockhash,
    Commitment,
    Reward,
    Slot,
    SolanaRpcResponse,
    TransactionForAccounts,
    TransactionForFullBase58,
    TransactionForFullBase64,
    TransactionForFullJson,
    TransactionForFullJsonParsed,
    U64UnsafeBeyond2Pow53Minus1,
    UnixTimestamp,
} from '@solana/rpc-types';
import type { TransactionVersion } from '@solana/transactions';

// Subscription notification types

type BlockNotificationsNotificationBase = Readonly<{
    /**
     * Errors can arise in generating a block notification.
     * If an error is encountered, this field will contain the error, and the `block` field will return null.
     * @see https://github.com/solana-labs/solana/blob/6ea51280ddc235ed93e16906c3427efd20cd7ce4/rpc/src/rpc_subscriptions.rs#L1059-L1074
     * @see https://github.com/solana-labs/solana/blob/6ea51280ddc235ed93e16906c3427efd20cd7ce4/rpc-client-api/src/response.rs#L507-L514
     */
    err: string | null;
    slot: Slot;
}>;

type BlockNotificationsNotificationBlock = Readonly<{
    /** The number of blocks beneath this block */
    blockHeight: U64UnsafeBeyond2Pow53Minus1;
    /** The number of blocks beneath this block */
    blockTime: UnixTimestamp;
    /** the blockhash of this block */
    blockhash: Blockhash;
    /** The slot index of this block's parent */
    parentSlot: Slot;
    /** The blockhash of this block's parent */
    previousBlockhash: Blockhash;
}>;

type BlockNotificationsNotificationBlockWithRewards = Readonly<{
    /** Block-level rewards */
    rewards: readonly Reward[];
}>;

type BlockNotificationsNotificationBlockWithSignatures = Readonly<{
    /** List of signatures applied to transactions in this block */
    signatures: readonly Base58EncodedBytes[];
}>;

type BlockNotificationsNotificationBlockWithTransactions<TTransaction> = Readonly<{
    transactions: readonly TTransaction[];
}>;

// Subscription parameter types

// Filter criteria for the logs to receive results by account type
// `mentionsAccountsOrProgram` object will return only transactions that mention
// the provided public key (as base-58 encoded string). If no mentions in a
// given block, then no notification will be sent.
type BlockNotificationsFilter = 'all' | { mentionsAccountOrProgram: string };

type BlockNotificationsCommonConfig = Readonly<{
    /** @defaultValue finalized */
    commitment?: Omit<Commitment, 'processed'>;
}>;

type BlockNotificationsEncoding = 'base58' | 'base64' | 'json' | 'jsonParsed';

// Max supported transaction version parameter:
// - `maxSupportedTransactionVersion` can only be provided with a number value. "legacy" is not a valid argument.
// This will throw a parse error (code -32602).
// - If `maxSupportedTransactionVersion` is not provided, the default value is "legacy".
// This will error if the block contains any transactions with a version greater than "legacy" (code -32015).
// - Also, If `maxSupportedTransactionVersion` is not provided, the `version` field of each transaction is omitted.
// - These rules apply to both "accounts" and "full" transaction details.
type BlockNotificationsMaxSupportedTransactionVersion = Exclude<TransactionVersion, 'legacy'>;

export interface BlockNotificationsApi extends RpcSubscriptionsApiMethods {
    /**
     * Subscribe to receive notification anytime a new block is Confirmed or Finalized.
     *
     * Note: The `block` field is a block object as seen in the `getBlock` RPC HTTP method.
     * @see https://docs.solana.com/api/http#getblock
     */
    // transactionDetails=none, rewards=false, encoding + maxSupportedTransactionVersion irrelevant
    blockNotifications(
        filter: BlockNotificationsFilter,
        config: BlockNotificationsCommonConfig &
            Readonly<{
                encoding?: BlockNotificationsEncoding;
                maxSupportedTransactionVersion?: BlockNotificationsMaxSupportedTransactionVersion;
                showRewards: false;
                transactionDetails: 'none';
            }>,
    ): SolanaRpcResponse<
        BlockNotificationsNotificationBase &
            Readonly<{
                block: BlockNotificationsNotificationBlock | null;
            }>
    >;
    // transactionDetails=none, rewards=missing/true, encoding + maxSupportedTransactionVersion irrelevant
    blockNotifications(
        filter: BlockNotificationsFilter,
        config: BlockNotificationsCommonConfig &
            Readonly<{
                encoding?: BlockNotificationsEncoding;
                maxSupportedTransactionVersion?: BlockNotificationsMaxSupportedTransactionVersion;
                showRewards?: true;
                transactionDetails: 'none';
            }>,
    ): SolanaRpcResponse<
        BlockNotificationsNotificationBase &
            Readonly<{
                block: (BlockNotificationsNotificationBlock & BlockNotificationsNotificationBlockWithRewards) | null;
            }>
    >;
    // transactionDetails=signatures, rewards=false, encoding + maxSupportedTransactionVersion irrelevant
    blockNotifications(
        filter: BlockNotificationsFilter,
        config: BlockNotificationsCommonConfig &
            Readonly<{
                encoding?: BlockNotificationsEncoding;
                maxSupportedTransactionVersion?: BlockNotificationsMaxSupportedTransactionVersion;
                showRewards: false;
                transactionDetails: 'signatures';
            }>,
    ): SolanaRpcResponse<
        BlockNotificationsNotificationBase &
            Readonly<{
                block: (BlockNotificationsNotificationBlock & BlockNotificationsNotificationBlockWithSignatures) | null;
            }>
    >;
    // transactionDetails=signatures, rewards=missing/true, encoding + maxSupportedTransactionVersion irrelevant
    blockNotifications(
        filter: BlockNotificationsFilter,
        config: BlockNotificationsCommonConfig &
            Readonly<{
                encoding?: BlockNotificationsEncoding;
                maxSupportedTransactionVersion?: BlockNotificationsMaxSupportedTransactionVersion;
                showRewards?: true;
                transactionDetails: 'signatures';
            }>,
    ): SolanaRpcResponse<
        BlockNotificationsNotificationBase &
            Readonly<{
                block:
                    | (BlockNotificationsNotificationBlock &
                          BlockNotificationsNotificationBlockWithRewards &
                          BlockNotificationsNotificationBlockWithSignatures)
                    | null;
            }>
    >;
    // transactionDetails=accounts, rewards=false, maxSupportedTransactionVersion=0, encoding irrelevant
    blockNotifications(
        filter: BlockNotificationsFilter,
        config: BlockNotificationsCommonConfig &
            Readonly<{
                encoding?: BlockNotificationsEncoding;
                maxSupportedTransactionVersion: BlockNotificationsMaxSupportedTransactionVersion;
                showRewards: false;
                transactionDetails: 'accounts';
            }>,
    ): SolanaRpcResponse<
        BlockNotificationsNotificationBase &
            Readonly<{
                block:
                    | (BlockNotificationsNotificationBlock &
                          BlockNotificationsNotificationBlockWithTransactions<
                              TransactionForAccounts<BlockNotificationsMaxSupportedTransactionVersion>
                          >)
                    | null;
            }>
    >;
    // transactionDetails=accounts, rewards=false, maxSupportedTransactionVersion=missing, encoding irrelevant
    blockNotifications(
        filter: BlockNotificationsFilter,
        config: BlockNotificationsCommonConfig &
            Readonly<{
                encoding?: BlockNotificationsEncoding;
                showRewards: false;
                transactionDetails: 'accounts';
            }>,
    ): SolanaRpcResponse<
        BlockNotificationsNotificationBase &
            Readonly<{
                block:
                    | (BlockNotificationsNotificationBlock &
                          BlockNotificationsNotificationBlockWithTransactions<TransactionForAccounts<void>>)
                    | null;
            }>
    >;
    // transactionDetails=accounts, rewards=missing/true, maxSupportedTransactionVersion=0, encoding irrelevant
    blockNotifications(
        filter: BlockNotificationsFilter,
        config: BlockNotificationsCommonConfig &
            Readonly<{
                encoding?: BlockNotificationsEncoding;
                maxSupportedTransactionVersion: BlockNotificationsMaxSupportedTransactionVersion;
                showRewards?: true;
                transactionDetails: 'accounts';
            }>,
    ): SolanaRpcResponse<
        BlockNotificationsNotificationBase &
            Readonly<{
                block:
                    | (BlockNotificationsNotificationBlock &
                          BlockNotificationsNotificationBlockWithRewards &
                          BlockNotificationsNotificationBlockWithTransactions<
                              TransactionForAccounts<BlockNotificationsMaxSupportedTransactionVersion>
                          >)
                    | null;
            }>
    >;
    // transactionDetails=accounts, rewards=missing/true, maxSupportedTransactionVersion=missing, encoding irrelevant
    blockNotifications(
        filter: BlockNotificationsFilter,
        config: BlockNotificationsCommonConfig &
            Readonly<{
                encoding?: BlockNotificationsEncoding;
                showRewards?: true;
                transactionDetails: 'accounts';
            }>,
    ): SolanaRpcResponse<
        BlockNotificationsNotificationBase &
            Readonly<{
                block:
                    | (BlockNotificationsNotificationBlock &
                          BlockNotificationsNotificationBlockWithRewards &
                          BlockNotificationsNotificationBlockWithTransactions<TransactionForAccounts<void>>)
                    | null;
            }>
    >;
    // transactionDetails=full (default), encoding=base58, rewards=false, maxSupportedTransactionVersion=0
    blockNotifications(
        filter: BlockNotificationsFilter,
        config: BlockNotificationsCommonConfig &
            Readonly<{
                encoding: 'base58';
                maxSupportedTransactionVersion: BlockNotificationsMaxSupportedTransactionVersion;
                showRewards: false;
                transactionDetails?: 'full';
            }>,
    ): SolanaRpcResponse<
        BlockNotificationsNotificationBase &
            Readonly<{
                block:
                    | (BlockNotificationsNotificationBlock &
                          BlockNotificationsNotificationBlockWithTransactions<
                              TransactionForFullBase58<BlockNotificationsMaxSupportedTransactionVersion>
                          >)
                    | null;
            }>
    >;
    // transactionDetails=full (default), encoding=base58, rewards=false, maxSupportedTransactionVersion=missing
    blockNotifications(
        filter: BlockNotificationsFilter,
        config: BlockNotificationsCommonConfig &
            Readonly<{
                encoding: 'base58';
                showRewards: false;
                transactionDetails?: 'full';
            }>,
    ): SolanaRpcResponse<
        BlockNotificationsNotificationBase &
            Readonly<{
                block:
                    | (BlockNotificationsNotificationBlock &
                          BlockNotificationsNotificationBlockWithTransactions<TransactionForFullBase58<void>>)
                    | null;
            }>
    >;
    // transactionDetails=full (default), encoding=base58, rewards=missing/true, maxSupportedTransactionVersion=0
    blockNotifications(
        filter: BlockNotificationsFilter,
        config: BlockNotificationsCommonConfig &
            Readonly<{
                encoding: 'base58';
                maxSupportedTransactionVersion: BlockNotificationsMaxSupportedTransactionVersion;
                showRewards?: true;
                transactionDetails?: 'full';
            }>,
    ): SolanaRpcResponse<
        BlockNotificationsNotificationBase &
            Readonly<{
                block:
                    | (BlockNotificationsNotificationBlock &
                          BlockNotificationsNotificationBlockWithRewards &
                          BlockNotificationsNotificationBlockWithTransactions<
                              TransactionForFullBase58<BlockNotificationsMaxSupportedTransactionVersion>
                          >)
                    | null;
            }>
    >;
    // transactionDetails=full (default), encoding=base58, rewards=missing/true, maxSupportedTransactionVersion=missing
    blockNotifications(
        filter: BlockNotificationsFilter,
        config: BlockNotificationsCommonConfig &
            Readonly<{
                encoding: 'base58';
                showRewards?: true;
                transactionDetails?: 'full';
            }>,
    ): SolanaRpcResponse<
        BlockNotificationsNotificationBase &
            Readonly<{
                block:
                    | (BlockNotificationsNotificationBlock &
                          BlockNotificationsNotificationBlockWithRewards &
                          BlockNotificationsNotificationBlockWithTransactions<TransactionForFullBase58<void>>)
                    | null;
            }>
    >;
    // transactionDetails=full (default), encoding=base64, rewards=false, maxSupportedTransactionVersion=0
    blockNotifications(
        filter: BlockNotificationsFilter,
        config: BlockNotificationsCommonConfig &
            Readonly<{
                encoding: 'base64';
                maxSupportedTransactionVersion: BlockNotificationsMaxSupportedTransactionVersion;
                showRewards: false;
                transactionDetails?: 'full';
            }>,
    ): SolanaRpcResponse<
        BlockNotificationsNotificationBase &
            Readonly<{
                block:
                    | (BlockNotificationsNotificationBlock &
                          BlockNotificationsNotificationBlockWithTransactions<
                              TransactionForFullBase64<BlockNotificationsMaxSupportedTransactionVersion>
                          >)
                    | null;
            }>
    >;
    // transactionDetails=full (default), encoding=base64, rewards=false, maxSupportedTransactionVersion=missing
    blockNotifications(
        filter: BlockNotificationsFilter,
        config: BlockNotificationsCommonConfig &
            Readonly<{
                encoding: 'base64';
                showRewards: false;
                transactionDetails?: 'full';
            }>,
    ): SolanaRpcResponse<
        BlockNotificationsNotificationBase &
            Readonly<{
                block:
                    | (BlockNotificationsNotificationBlock &
                          BlockNotificationsNotificationBlockWithTransactions<TransactionForFullBase64<void>>)
                    | null;
            }>
    >;
    // transactionDetails=full (default), encoding=base64, rewards=missing/true, maxSupportedTransactionVersion=0
    blockNotifications(
        filter: BlockNotificationsFilter,
        config: BlockNotificationsCommonConfig &
            Readonly<{
                encoding: 'base64';
                maxSupportedTransactionVersion: BlockNotificationsMaxSupportedTransactionVersion;
                showRewards?: true;
                transactionDetails?: 'full';
            }>,
    ): SolanaRpcResponse<
        BlockNotificationsNotificationBase &
            Readonly<{
                block:
                    | (BlockNotificationsNotificationBlock &
                          BlockNotificationsNotificationBlockWithRewards &
                          BlockNotificationsNotificationBlockWithTransactions<
                              TransactionForFullBase64<BlockNotificationsMaxSupportedTransactionVersion>
                          >)
                    | null;
            }>
    >;
    // transactionDetails=full (default), encoding=base64, rewards=missing/true, maxSupportedTransactionVersion=missing
    blockNotifications(
        filter: BlockNotificationsFilter,
        config: BlockNotificationsCommonConfig &
            Readonly<{
                encoding: 'base64';
                showRewards?: true;
                transactionDetails?: 'full';
            }>,
    ): SolanaRpcResponse<
        BlockNotificationsNotificationBase &
            Readonly<{
                block:
                    | (BlockNotificationsNotificationBlock &
                          BlockNotificationsNotificationBlockWithRewards &
                          BlockNotificationsNotificationBlockWithTransactions<TransactionForFullBase64<void>>)
                    | null;
            }>
    >;
    // transactionDetails=full (default), encoding=jsonParsed, rewards=false, maxSupportedTransactionVersion=0
    blockNotifications(
        filter: BlockNotificationsFilter,
        config: BlockNotificationsCommonConfig &
            Readonly<{
                encoding: 'jsonParsed';
                maxSupportedTransactionVersion: BlockNotificationsMaxSupportedTransactionVersion;
                showRewards: false;
                transactionDetails?: 'full';
            }>,
    ): SolanaRpcResponse<
        BlockNotificationsNotificationBase &
            Readonly<{
                block:
                    | (BlockNotificationsNotificationBlock &
                          BlockNotificationsNotificationBlockWithTransactions<
                              TransactionForFullJsonParsed<BlockNotificationsMaxSupportedTransactionVersion>
                          >)
                    | null;
            }>
    >;
    // transactionDetails=full (default), encoding=jsonParsed, rewards=false, maxSupportedTransactionVersion=missing
    blockNotifications(
        filter: BlockNotificationsFilter,
        config: BlockNotificationsCommonConfig &
            Readonly<{
                encoding: 'jsonParsed';
                showRewards: false;
                transactionDetails?: 'full';
            }>,
    ): SolanaRpcResponse<
        BlockNotificationsNotificationBase &
            Readonly<{
                block:
                    | (BlockNotificationsNotificationBlock &
                          BlockNotificationsNotificationBlockWithTransactions<TransactionForFullJsonParsed<void>>)
                    | null;
            }>
    >;
    // transactionDetails=full (default), encoding=jsonParsed, rewards=missing/true, maxSupportedTransactionVersion=0
    blockNotifications(
        filter: BlockNotificationsFilter,
        config: BlockNotificationsCommonConfig &
            Readonly<{
                encoding: 'jsonParsed';
                maxSupportedTransactionVersion: BlockNotificationsMaxSupportedTransactionVersion;
                showRewards?: true;
                transactionDetails?: 'full';
            }>,
    ): SolanaRpcResponse<
        BlockNotificationsNotificationBase &
            Readonly<{
                block:
                    | (BlockNotificationsNotificationBlock &
                          BlockNotificationsNotificationBlockWithRewards &
                          BlockNotificationsNotificationBlockWithTransactions<
                              TransactionForFullJsonParsed<BlockNotificationsMaxSupportedTransactionVersion>
                          >)
                    | null;
            }>
    >;
    // transactionDetails=full (default), encoding=jsonParsed, rewards=missing/true, maxSupportedTransactionVersion=missing
    blockNotifications(
        filter: BlockNotificationsFilter,
        config: BlockNotificationsCommonConfig &
            Readonly<{
                encoding: 'jsonParsed';
                showRewards?: true;
                transactionDetails?: 'full';
            }>,
    ): SolanaRpcResponse<
        BlockNotificationsNotificationBase &
            Readonly<{
                block:
                    | (BlockNotificationsNotificationBlock &
                          BlockNotificationsNotificationBlockWithRewards &
                          BlockNotificationsNotificationBlockWithTransactions<TransactionForFullJsonParsed<void>>)
                    | null;
            }>
    >;
    // transactionDetails=full (default), encoding=json (default), rewards=false, maxSupportedTransactionVersion=0
    blockNotifications(
        filter: BlockNotificationsFilter,
        config: BlockNotificationsCommonConfig &
            Readonly<{
                encoding?: 'json';
                maxSupportedTransactionVersion: BlockNotificationsMaxSupportedTransactionVersion;
                showRewards: false;
                transactionDetails?: 'full';
            }>,
    ): SolanaRpcResponse<
        BlockNotificationsNotificationBase &
            Readonly<{
                block:
                    | (BlockNotificationsNotificationBlock &
                          BlockNotificationsNotificationBlockWithTransactions<
                              TransactionForFullJson<BlockNotificationsMaxSupportedTransactionVersion>
                          >)
                    | null;
            }>
    >;
    // transactionDetails=full (default), encoding=json (default), rewards=false, maxSupportedTransactionVersion=missing
    blockNotifications(
        filter: BlockNotificationsFilter,
        config: BlockNotificationsCommonConfig &
            Readonly<{
                encoding?: 'json';
                showRewards: false;
                transactionDetails?: 'full';
            }>,
    ): SolanaRpcResponse<
        BlockNotificationsNotificationBase &
            Readonly<{
                block:
                    | (BlockNotificationsNotificationBlock &
                          BlockNotificationsNotificationBlockWithTransactions<TransactionForFullJson<void>>)
                    | null;
            }>
    >;
    // transactionDetails=full (default), encoding=json (default), rewards=missing/true, maxSupportedTransactionVersion=0
    blockNotifications(
        filter: BlockNotificationsFilter,
        config: BlockNotificationsCommonConfig &
            Readonly<{
                encoding?: 'json';
                maxSupportedTransactionVersion: BlockNotificationsMaxSupportedTransactionVersion;
                showRewards?: true;
                transactionDetails?: 'full';
            }>,
    ): SolanaRpcResponse<
        BlockNotificationsNotificationBase &
            Readonly<{
                block:
                    | (BlockNotificationsNotificationBlock &
                          BlockNotificationsNotificationBlockWithRewards &
                          BlockNotificationsNotificationBlockWithTransactions<
                              TransactionForFullJson<BlockNotificationsMaxSupportedTransactionVersion>
                          >)
                    | null;
            }>
    >;
    // transactionDetails=full (default), encoding=json (default), rewards=missing/true, maxSupportedTransactionVersion=missing
    blockNotifications(
        filter: BlockNotificationsFilter,
        config?: BlockNotificationsCommonConfig &
            Readonly<{
                encoding?: 'json';
                showRewards?: true;
                transactionDetails?: 'full';
            }>,
    ): SolanaRpcResponse<
        BlockNotificationsNotificationBase &
            Readonly<{
                block:
                    | (BlockNotificationsNotificationBlock &
                          BlockNotificationsNotificationBlockWithRewards &
                          BlockNotificationsNotificationBlockWithTransactions<TransactionForFullJson<void>>)
                    | null;
            }>
    >;
}
