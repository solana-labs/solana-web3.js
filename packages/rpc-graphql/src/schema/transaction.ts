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

    """
    A Solana transaction
    """
    type Transaction {
        blockTime: BigInt
        data(encoding: TransactionEncoding!): String
        message: TransactionMessage
        meta: TransactionMeta
        signatures: [Signature]
        slot: Slot
        version: String
    }
`;
