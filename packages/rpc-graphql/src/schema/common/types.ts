import { resolveAccount } from '../../resolvers/account';

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

export const commonResolvers = {
    AccountEncoding: {
        BASE_58: 'base58',
        BASE_64: 'base64',
        BASE_64_ZSTD: 'base64+zstd',
        PARSED: 'jsonParsed',
    },
    TokenBalance: {
        mint: resolveAccount('mint'),
        owner: resolveAccount('owner'),
    },
    TransactionEncoding: {
        BASE_58: 'base58',
        BASE_64: 'base64',
        PARSED: 'jsonParsed',
    },
    TransactionVersion: {
        LEGACY: 'legacy',
        ZERO: 0,
    },
};
