import { Slot } from '@solana/rpc-core/dist/types/rpc-methods/common';
import { Commitment } from '@solana/rpc-types';

export type BlockQueryArgs = {
    slot: Slot;
    commitment?: Commitment;
    encoding?: 'base58' | 'base64' | 'jsonParsed';
    transactionDetails?: 'accounts' | 'full' | 'none' | 'signatures';
};

export const blockTypeDefs = /* GraphQL */ `
    type TransactionMetaForAccounts {
        err: String
        fee: BigInt
        postBalances: [BigInt]
        postTokenBalances: [TokenBalance]
        preBalances: [BigInt]
        preTokenBalances: [TokenBalance]
        status: TransactionStatus
    }

    type TransactionDataForAccounts {
        accountKeys: [String]
        signatures: [String]
    }

    type BlockTransactionAccounts {
        meta: TransactionMetaForAccounts
        data: TransactionDataForAccounts
        version: String
    }

    # Block interface
    interface Block {
        blockHeight: BigInt
        blockTime: BigInt
        blockhash: String
        parentSlot: BigInt
        previousBlockhash: String
        rewards: [Reward]
    }

    # A block with account transaction details
    type BlockWithAccounts {
        blockHeight: BigInt
        blockTime: BigInt
        blockhash: String
        parentSlot: BigInt
        previousBlockhash: String
        rewards: [Reward]
        transactions: [BlockTransactionAccounts]
    }

    # A block with full transaction details
    type BlockFull {
        blockHeight: BigInt
        blockTime: BigInt
        blockhash: String
        parentSlot: BigInt
        previousBlockhash: String
        rewards: [Reward]
        transactions: [Transaction]
    }

    # A block with none transaction details
    type BlockWithNone {
        blockHeight: BigInt
        blockTime: BigInt
        blockhash: String
        parentSlot: BigInt
        previousBlockhash: String
        rewards: [Reward]
    }

    # A block with signature transaction details
    type BlockWithSignatures {
        blockHeight: BigInt
        blockTime: BigInt
        blockhash: String
        parentSlot: BigInt
        previousBlockhash: String
        rewards: [Reward]
        signatures: [String]
    }
`;

export const blockResolvers = {};
