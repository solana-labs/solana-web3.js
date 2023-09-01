import { Blockhash, TransactionVersion } from '@solana/transactions';

import { TransactionSignature } from '../transaction-signature';
import { UnixTimestamp } from '../unix-timestamp';
import { Commitment, Reward, Slot, U64UnsafeBeyond2Pow53Minus1 } from './common';
import { GetTransactionApi } from './getTransaction';

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
    rewards: Reward[];
}>;

type GetBlockApiResponseWithSignatures = Readonly<{
    signatures: TransactionSignature[];
}>;

type GetBlockApiResponseWithTransactions<TTransaction> = Readonly<{
    transactions: TTransaction[];
}>;

type GetBlockCommonConfig<TMaxSupportedTransactionVersion, TBlockRewards> = Readonly<{
    /** @defaultValue finalized */
    commitment?: Omit<Commitment, 'processed'>;
    maxSupportedTransactionVersion?: TMaxSupportedTransactionVersion;
    rewards?: TBlockRewards;
}>;

export interface GetBlockApi {
    /**
     * Returns identity and transaction information about a confirmed block in the ledger
     */
    getBlock<
        TMaxSupportedTransactionVersion extends TransactionVersion | void = void,
        TBlockRewards extends boolean | void = void
    >(
        slot: Slot,
        config: GetBlockCommonConfig<TMaxSupportedTransactionVersion, TBlockRewards> &
            Readonly<{
                transactionDetails: 'full';
                encoding: 'jsonParsed';
            }>
    ):
        | (GetBlockApiResponseBase &
              GetBlockApiResponseWithTransactions<ReturnType<GetTransactionApi['getTransaction']>> &
              (TBlockRewards extends void ? Record<string, never> : GetBlockApiResponseWithRewards))
        | null;
    getBlock<
        TMaxSupportedTransactionVersion extends TransactionVersion | void = void,
        TBlockRewards extends boolean | void = void
    >(
        slot: Slot,
        config: GetBlockCommonConfig<TMaxSupportedTransactionVersion, TBlockRewards> &
            Readonly<{
                transactionDetails: 'full';
                encoding: 'base64';
            }>
    ):
        | (GetBlockApiResponseBase &
              GetBlockApiResponseWithTransactions<ReturnType<GetTransactionApi['getTransaction']>> &
              (TBlockRewards extends void ? Record<string, never> : GetBlockApiResponseWithRewards))
        | null;
    getBlock<
        TMaxSupportedTransactionVersion extends TransactionVersion | void = void,
        TBlockRewards extends boolean | void = void
    >(
        slot: Slot,
        config: GetBlockCommonConfig<TMaxSupportedTransactionVersion, TBlockRewards> &
            Readonly<{
                transactionDetails: 'full';
                encoding: 'base58';
            }>
    ):
        | (GetBlockApiResponseBase &
              GetBlockApiResponseWithTransactions<ReturnType<GetTransactionApi['getTransaction']>> &
              (TBlockRewards extends void ? Record<string, never> : GetBlockApiResponseWithRewards))
        | null;
    getBlock<
        TMaxSupportedTransactionVersion extends TransactionVersion | void = void,
        TBlockRewards extends boolean | void = void
    >(
        slot: Slot,
        config?: GetBlockCommonConfig<TMaxSupportedTransactionVersion, TBlockRewards> &
            Readonly<{
                transactionDetails: 'full';
                encoding?: 'json';
            }>
    ):
        | (GetBlockApiResponseBase &
              GetBlockApiResponseWithTransactions<ReturnType<GetTransactionApi['getTransaction']>> &
              (TBlockRewards extends void ? Record<string, never> : GetBlockApiResponseWithRewards))
        | null;
    getBlock<
        TMaxSupportedTransactionVersion extends TransactionVersion | void = void,
        TBlockRewards extends boolean | void = void
    >(
        slot: Slot,
        config: GetBlockCommonConfig<TMaxSupportedTransactionVersion, TBlockRewards> &
            Readonly<{
                transactionDetails: 'accounts';
                encoding?: 'jsonParsed' | 'base64' | 'base58' | 'json';
            }>
    ):
        | (GetBlockApiResponseBase &
              GetBlockApiResponseWithSignatures &
              (TBlockRewards extends void ? Record<string, never> : GetBlockApiResponseWithRewards))
        | null;
    getBlock<
        TMaxSupportedTransactionVersion extends TransactionVersion | void = void,
        TBlockRewards extends boolean | void = void
    >(
        slot: Slot,
        config: GetBlockCommonConfig<TMaxSupportedTransactionVersion, TBlockRewards> &
            Readonly<{
                transactionDetails: 'signatures';
                encoding?: 'jsonParsed' | 'base64' | 'base58' | 'json';
            }>
    ):
        | (GetBlockApiResponseBase &
              GetBlockApiResponseWithSignatures &
              (TBlockRewards extends void ? Record<string, never> : GetBlockApiResponseWithRewards))
        | null;
    getBlock<
        TMaxSupportedTransactionVersion extends TransactionVersion | void = void,
        TBlockRewards extends boolean | void = void
    >(
        slot: Slot,
        config: GetBlockCommonConfig<TMaxSupportedTransactionVersion, TBlockRewards> &
            Readonly<{
                transactionDetails: 'none';
                encoding?: 'jsonParsed' | 'base64' | 'base58' | 'json';
            }>
    ):
        | (GetBlockApiResponseBase &
              (TBlockRewards extends void ? Record<string, never> : GetBlockApiResponseWithRewards))
        | null;
}
