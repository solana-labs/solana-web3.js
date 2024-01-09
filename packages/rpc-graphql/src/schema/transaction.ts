/* eslint-disable sort-keys-fix/sort-keys-fix */
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
        pubkey: Address
        signer: Boolean
        source: String
        writable: Boolean
    }

    type TransactionMessageAddressTableLookup {
        accountKey: Address
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
        meta: TransactionMeta
        slot: BigInt
        version: String
    }

    # A transaction with base58 encoded data
    type TransactionBase58 implements Transaction {
        blockTime: String
        data: Base58EncodedBytes
        meta: TransactionMeta
        slot: BigInt
        version: String
    }

    # A transaction with base64 encoded data
    type TransactionBase64 implements Transaction {
        blockTime: String
        data: Base64EncodedBytes
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
