export const commonTypeDefs = /* GraphQL */ `
    enum AccountEncoding {
        BASE_58
        BASE_64
        BASE_64_ZSTD
        PARSED
    }

    enum BlockTransactionDetails {
        accounts
        full
        none
        signatures
    }

    enum Commitment {
        confirmed
        finalized
        processed
    }

    type ReturnData {
        data: Base64EncodedBytes
        programId: Address
    }

    type Reward {
        commission: Int
        lamports: BigInt
        postBalance: BigInt
        pubkey: Address
        rewardType: String
    }

    type TokenAmount {
        amount: String
        decimals: Int
        uiAmount: BigInt
        uiAmountString: String
    }

    type TokenBalance {
        accountIndex: Int
        mint: Account
        owner: Account
        programId: Address
        uiTokenAmount: TokenAmount
    }

    enum TransactionEncoding {
        BASE_58
        BASE_64
        PARSED
    }

    enum TransactionVersion {
        LEGACY
        ZERO
    }
`;
