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
        readonly: [Address]
        writable: [Address]
    }

    type TransactionInnerInstruction {
        index: Int
        instructions: [TransactionInstruction]
    }

    type TransactionMeta {
        computeUnitsConsumed: BigInt
        err: String
        fee: Lamports
        innerInstructions: [TransactionInnerInstruction]
        loadedAddresses: TransactionLoadedAddresses
        logMessages: [String]
        postBalances: [Lamports]
        postTokenBalances: [TokenBalance]
        preBalances: [Lamports]
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
        recentBlockhash: Hash
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
