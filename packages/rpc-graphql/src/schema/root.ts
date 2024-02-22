export const rootTypeDefs = /* GraphQL */ `
    type Query {
        account(address: Address!, commitment: Commitment, minContextSlot: Slot): Account
        block(
            slot: Slot!
            commitment: Commitment
            encoding: TransactionEncoding
            transactionDetails: BlockTransactionDetails
        ): Block
        programAccounts(
            programAddress: Address!
            commitment: Commitment
            filters: [ProgramAccountsFilter]
            minContextSlot: Slot
        ): [Account]
        transaction(signature: Signature!, commitment: Commitment, encoding: TransactionEncoding): Transaction
    }

    schema {
        query: Query
    }
`;
