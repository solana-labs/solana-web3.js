export const inputTypeDefs = /* GraphQL */ `
    input DataSlice {
        offset: Int
        length: Int
    }

    input ProgramAccountsFilter {
        bytes: BigInt
        dataSize: BigInt
        encoding: AccountEncoding
        offset: BigInt
    }
`;

export const inputResolvers = {};
