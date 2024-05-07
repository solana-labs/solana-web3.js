export const blockTypeDefs = /* GraphQL */ `
    """
    A Solana block
    """
    type Block {
        id: ID!
        blockhash: Hash
        blockHeight: BigInt
        blockTime: BigInt
        parentSlot: Slot
        previousBlockhash: Hash
        rewards: [Reward]
        signatures: [Signature]
        slot: Slot
        transactions: [Transaction]
    }
`;
