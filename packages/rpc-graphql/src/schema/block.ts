export const blockTypeDefs = /* GraphQL */ `
    """
    A Solana block
    """
    type Block {
        blockhash: String
        blockHeight: BigInt
        blockTime: BigInt
        parentSlot: Slot
        previousBlockhash: String
        rewards: [Reward]
        signatures: [Signature]
        transactions: [Transaction]
    }
`;
