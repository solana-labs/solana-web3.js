export const rootTypeDefs = /* GraphQL */ `
    type Query {
        account(address: Address!, commitment: Commitment, minContextSlot: Slot): Account
        block(slot: Slot!, commitment: CommitmentWithoutProcessed): Block
        programAccounts(
            programAddress: Address!
            commitment: Commitment
            filters: [ProgramAccountsFilter]
            minContextSlot: Slot
        ): [Account]
        transaction(signature: Signature!, commitment: CommitmentWithoutProcessed): Transaction
    }

    schema {
        query: Query
    }
`;
