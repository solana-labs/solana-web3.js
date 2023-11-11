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
        blockhash: String
        blockHeight: BigInt
        blockTime: Int
        parentSlot: BigInt
        previousBlockhash: String
        rewards: [Reward]
        transactionDetails: String
    }

    # A block with account transaction details
    type BlockWithAccounts implements Block {
        blockhash: String
        blockHeight: BigInt
        blockTime: Int
        parentSlot: BigInt
        previousBlockhash: String
        rewards: [Reward]
        transactions: [BlockTransactionAccounts]
        transactionDetails: String
    }

    # A block with full transaction details
    type BlockWithFull implements Block {
        blockhash: String
        blockHeight: BigInt
        blockTime: Int
        parentSlot: BigInt
        previousBlockhash: String
        rewards: [Reward]
        transactions: [Transaction]
        transactionDetails: String
    }

    # A block with none transaction details
    type BlockWithNone implements Block {
        blockhash: String
        blockHeight: BigInt
        blockTime: Int
        parentSlot: BigInt
        previousBlockhash: String
        rewards: [Reward]
        transactionDetails: String
    }

    # A block with signature transaction details
    type BlockWithSignatures implements Block {
        blockhash: String
        blockHeight: BigInt
        blockTime: Int
        parentSlot: BigInt
        previousBlockhash: String
        rewards: [Reward]
        signatures: [String]
        transactionDetails: String
    }
`;

export const blockResolvers = {
    Block: {
        __resolveType(block: { transactionDetails: string }) {
            switch (block.transactionDetails) {
                case 'accounts':
                    return 'BlockWithAccounts';
                case 'none':
                    return 'BlockWithNone';
                case 'signatures':
                    return 'BlockWithSignatures';
                default:
                    return 'BlockWithFull';
            }
        },
    },
};
