export const blockTypeDefs = /* GraphQL */ `
    """
    A Solana block
    """
    type Block {
        blockhash: Hash
        blockHeight: BigInt
        blockTime: BigInt
        parentSlot: Block
        previousBlockhash: Hash
        rewards: [Reward]
        signatures: [Signature]
        slot: Slot
        transactions: [Transaction]
    }
`;
