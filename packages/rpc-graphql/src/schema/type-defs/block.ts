export const blockTypeDefs = /* GraphQL */ `
    """
    A Solana block
    """
    type Block {
        blockhash: Hash
        blockHeight: BigInt
        blockTime: BigInt
        parentSlot: Slot
        previousBlockhash: Hash
        rewards: [Reward]
        signatures: [Signature]
        transactions: [Transaction]
    }
`;
