export const inputTypeDefs = /* GraphQL */ `
    enum AccountEncoding {
        base58
        base64
        base64Zstd
        jsonParsed
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

    input DataSlice {
        offset: Int
        length: Int
    }

    input ProgramAccountsFilter {
        bytes: BigInt
        dataSize: BigInt
        encoding: String
        offset: BigInt
    }

    enum TransactionEncoding {
        base58
        base64
        jsonParsed
    }

    enum TransactionVersion {
        legacy
        zero
    }
`;

export const inputResolvers = {
    AccountEncoding: {
        base64Zstd: 'base64+zstd',
    },
    TransactionVersion: {
        zero: 0,
    },
};
