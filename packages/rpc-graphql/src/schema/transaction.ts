/* eslint-disable sort-keys-fix/sort-keys-fix */
import { Signature } from '@solana/keys';
import { Commitment } from '@solana/rpc-types';

export type TransactionQueryArgs = {
    signature: Signature;
    commitment?: Commitment;
    encoding?: 'base58' | 'base64' | 'jsonParsed';
};

export const transactionTypeDefs = /* GraphQL */ `
    type TransactionStatusOk {
        Ok: String
    }
    type TransactionStatusErr {
        Err: String
    }
    union TransactionStatus = TransactionStatusOk | TransactionStatusErr

    type TransactionLoadedAddresses {
        readonly: [String]
        writable: [String]
    }

    type TransactionInnerInstruction {
        index: Int
        instructions: [TransactionInstruction]
    }

    type TransactionMeta {
        computeUnitsConsumed: BigInt
        err: String
        fee: BigInt
        innerInstructions: [TransactionInnerInstruction]
        loadedAddresses: TransactionLoadedAddresses
        logMessages: [String]
        postBalances: [BigInt]
        postTokenBalances: [TokenBalance]
        preBalances: [BigInt]
        preTokenBalances: [TokenBalance]
        returnData: ReturnData
        rewards: [Reward]
        status: TransactionStatus
    }

    type TransactionMessageAccountKey {
        pubkey: String
        signer: Boolean
        source: String
        writable: Boolean
    }

    type TransactionMessageAddressTableLookup {
        accountKey: String
        readableIndexes: [Int]
        writableIndexes: [Int]
    }

    type TransactionMessageHeader {
        numReadonlySignedAccounts: Int
        numReadonlyUnsignedAccounts: Int
        numRequiredSignatures: Int
    }

    type TransactionMessage {
        accountKeys: [TransactionMessageAccountKey]
        addressTableLookups: [TransactionMessageAddressTableLookup]
        header: TransactionMessageHeader
        instructions: [TransactionInstruction]
        recentBlockhash: String
    }

    # Transaction interface
    interface Transaction {
        blockTime: String
        encoding: String
        meta: TransactionMeta
        slot: BigInt
        version: String
    }

    # A transaction with base58 encoded data
    type TransactionBase58 implements Transaction {
        blockTime: String
        data: String
        encoding: String
        meta: TransactionMeta
        slot: BigInt
        version: String
    }

    # A transaction with base64 encoded data
    type TransactionBase64 implements Transaction {
        blockTime: String
        data: String
        encoding: String
        meta: TransactionMeta
        slot: BigInt
        version: String
    }

    # A transaction with JSON encoded data
    type TransactionDataParsed {
        message: TransactionMessage
        signatures: [String]
    }
    type TransactionParsed implements Transaction {
        blockTime: String
        data: TransactionDataParsed
        encoding: String
        meta: TransactionMeta
        slot: BigInt
        version: String
    }
`;

export const transactionResolvers = {
    Transaction: {
        __resolveType(transaction: { encoding: string }) {
            switch (transaction.encoding) {
                case 'base58':
                    return 'TransactionBase58';
                case 'base64':
                    return 'TransactionBase64';
                default:
                    return 'TransactionParsed';
            }
        },
    },
};
