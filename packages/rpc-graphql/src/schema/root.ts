export const rootTypeDefs = /* GraphQL */ `
    type Query {
        account(
            address: String!
            commitment: Commitment
            dataSlice: DataSlice
            encoding: AccountEncoding
            minContextSlot: BigInt
        ): Account
        block(
            slot: BigInt!
            commitment: Commitment
            encoding: TransactionEncoding
            transactionDetails: BlockTransactionDetails
        ): Block
        programAccounts(
            programAddress: String!
            commitment: Commitment
            dataSlice: DataSlice
            encoding: AccountEncoding
            filters: [ProgramAccountsFilter]
            minContextSlot: BigInt
        ): [Account]
        transaction(signature: String!, commitment: Commitment, encoding: TransactionEncoding): Transaction
    }

    schema {
        query: Query
    }
`;
