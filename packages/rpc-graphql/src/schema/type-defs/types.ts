export const typeTypeDefs = /* GraphQL */ `
    enum AccountEncoding {
        BASE_58
        BASE_64
        BASE_64_ZSTD
    }

    scalar Address

    scalar Base58EncodedBytes

    scalar Base64EncodedBytes

    scalar Base64ZstdEncodedBytes

    scalar BigInt

    enum Commitment {
        CONFIRMED
        FINALIZED
        PROCESSED
    }

    enum CommitmentWithoutProcessed {
        CONFIRMED
        FINALIZED
    }

    input DataSlice {
        offset: Int!
        length: Int!
    }

    scalar Epoch

    scalar Hash

    scalar Lamports

    input ProgramAccountsDataSizeFilter {
        dataSize: BigInt!
    }

    enum ProgramAccountsMemcmpFilterAccountEncoding {
        BASE_58
        BASE_64
    }

    input ProgramAccountsMemcmpFilter {
        bytes: String!
        encoding: ProgramAccountsMemcmpFilterAccountEncoding!
        offset: BigInt!
    }

    type ReturnData {
        data: Base64EncodedBytes
        programId: Address
    }

    type Reward {
        commission: Int
        lamports: Lamports
        postBalance: BigInt
        pubkey: Address
        rewardType: String
    }

    scalar Signature

    scalar Slot

    enum SplTokenDefaultAccountState {
        FROZEN
        INITIALIZED
        UNINITIALIZED
    }

    enum SplTokenExtensionType {
        UNINITIALIZED
        TRANSFER_FEE_CONFIG
        TRANSFER_FEE_AMOUNT
        MINT_CLOSE_AUTHORITY
        CONFIDENTIAL_TRANSFER_MINT
        CONFIDENTIAL_TRANSFER_ACCOUNT
        DEFAULT_ACCOUNT_STATE
        IMMUTABLE_OWNER
        MEMO_TRANSFER
        NON_TRANSFERABLE
        INTEREST_BEARING_CONFIG
        CPI_GUARD
        PERMANENT_DELEGATE
        NON_TRANSFERABLE_ACCOUNT
        CONFIDENTIAL_TRANSFER_FEE_CONFIG
        CONFIDENTIAL_TRANSFER_FEE_AMOUNT
        TRANSFER_HOOK
        TRANSFER_HOOK_ACCOUNT
        METADATA_POINTER
        TOKEN_METADATA
        GROUP_POINTER
        GROUP_MEMBER_POINTER
        TOKEN_GROUP
        TOKEN_GROUP_MEMBER
        UNPARSEABLE_EXTENSION
    }

    type TokenAmount {
        amount: BigInt
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
    }
`;
