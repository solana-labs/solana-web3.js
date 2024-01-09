/* eslint-disable sort-keys-fix/sort-keys-fix */
import { resolveAccount } from '../resolvers/account';

export const accountTypeDefs = /* GraphQL */ `
    # Account interface
    interface Account {
        address: Address
        executable: Boolean
        lamports: BigInt
        ownerProgram: Account
        space: BigInt
        rentEpoch: BigInt
    }

    # An account with base58 encoded data
    type AccountBase58 implements Account {
        address: Address
        data: Base58EncodedBytes
        executable: Boolean
        lamports: BigInt
        ownerProgram: Account
        space: BigInt
        rentEpoch: BigInt
    }

    # An account with base64 encoded data
    type AccountBase64 implements Account {
        address: Address
        data: Base64EncodedBytes
        executable: Boolean
        lamports: BigInt
        ownerProgram: Account
        space: BigInt
        rentEpoch: BigInt
    }

    # An account with base64+zstd encoded data
    type AccountBase64Zstd implements Account {
        address: Address
        data: Base64ZstdEncodedBytes
        executable: Boolean
        lamports: BigInt
        ownerProgram: Account
        space: BigInt
        rentEpoch: BigInt
    }

    # A nonce account
    type NonceAccountFeeCalculator {
        lamportsPerSignature: String
    }
    type NonceAccount implements Account {
        address: Address
        executable: Boolean
        lamports: BigInt
        ownerProgram: Account
        space: BigInt
        rentEpoch: BigInt
        authority: Account
        blockhash: String
        feeCalculator: NonceAccountFeeCalculator
    }

    # A lookup table account
    type LookupTableAccount implements Account {
        address: Address
        executable: Boolean
        lamports: BigInt
        ownerProgram: Account
        space: BigInt
        rentEpoch: BigInt
        addresses: [Address]
        authority: Account
        deactivationSlot: String
        lastExtendedSlot: String
        lastExtendedSlotStartIndex: Int
    }

    # A mint account
    type MintAccount implements Account {
        address: Address
        executable: Boolean
        lamports: BigInt
        ownerProgram: Account
        space: BigInt
        rentEpoch: BigInt
        decimals: Int
        freezeAuthority: Account
        isInitialized: Boolean
        mintAuthority: Account
        supply: String
    }

    # A token account
    type TokenAccount implements Account {
        address: Address
        executable: Boolean
        lamports: BigInt
        ownerProgram: Account
        space: BigInt
        rentEpoch: BigInt
        isNative: Boolean
        mint: Account
        owner: Account
        state: String
        tokenAmount: TokenAmount
    }

    # A stake account
    type StakeAccountDataMetaAuthorized {
        staker: Account
        withdrawer: Account
    }
    type StakeAccountDataMetaLockup {
        custodian: Account
        epoch: BigInt
        unixTimestamp: BigInt
    }
    type StakeAccountDataMeta {
        authorized: StakeAccountDataMetaAuthorized
        lockup: StakeAccountDataMetaLockup
        rentExemptReserve: String
    }
    type StakeAccountDataStakeDelegation {
        activationEpoch: BigInt
        deactivationEpoch: BigInt
        stake: String
        voter: Account
        warmupCooldownRate: Int
    }
    type StakeAccountDataStake {
        creditsObserved: BigInt
        delegation: StakeAccountDataStakeDelegation
    }
    type StakeAccount implements Account {
        address: Address
        executable: Boolean
        lamports: BigInt
        ownerProgram: Account
        space: BigInt
        rentEpoch: BigInt
        meta: StakeAccountDataMeta
        stake: StakeAccountDataStake
    }

    # A vote account
    type VoteAccountDataAuthorizedVoter {
        authorizedVoter: Account
        epoch: BigInt
    }
    type VoteAccountDataEpochCredit {
        credits: String
        epoch: BigInt
        previousCredits: String
    }
    type VoteAccountDataLastTimestamp {
        slot: BigInt
        timestamp: BigInt
    }
    type VoteAccountDataVote {
        confirmationCount: Int
        slot: BigInt
    }
    type VoteAccount implements Account {
        address: Address
        executable: Boolean
        lamports: BigInt
        ownerProgram: Account
        space: BigInt
        rentEpoch: BigInt
        authorizedVoters: [VoteAccountDataAuthorizedVoter]
        authorizedWithdrawer: Account
        commission: Int
        epochCredits: [VoteAccountDataEpochCredit]
        lastTimestamp: VoteAccountDataLastTimestamp
        node: Account
        priorVoters: [Address]
        rootSlot: BigInt
        votes: [VoteAccountDataVote]
    }
`;

export const accountResolvers = {
    Account: {
        __resolveType(account: { encoding: string; programName: string; accountType: string }) {
            if (account.encoding === 'base58') {
                return 'AccountBase58';
            }
            if (account.encoding === 'base64') {
                return 'AccountBase64';
            }
            if (account.encoding === 'base64+zstd') {
                return 'AccountBase64Zstd';
            }
            if (account.encoding === 'jsonParsed') {
                if (account.programName === 'nonce') {
                    return 'NonceAccount';
                }
                if (account.accountType === 'mint' && account.programName === 'spl-token') {
                    return 'MintAccount';
                }
                if (account.accountType === 'account' && account.programName === 'spl-token') {
                    return 'TokenAccount';
                }
                if (account.programName === 'stake') {
                    return 'StakeAccount';
                }
                if (account.accountType === 'vote' && account.programName === 'vote') {
                    return 'VoteAccount';
                }
                if (account.accountType === 'lookupTable' && account.programName === 'address-lookup-table') {
                    return 'LookupTableAccount';
                }
            }
            return 'AccountBase64';
        },
    },
    AccountBase58: {
        ownerProgram: resolveAccount('ownerProgram'),
    },
    AccountBase64: {
        ownerProgram: resolveAccount('ownerProgram'),
    },
    AccountBase64Zstd: {
        ownerProgram: resolveAccount('ownerProgram'),
    },
    NonceAccount: {
        authority: resolveAccount('authority'),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    LookupTableAccount: {
        authority: resolveAccount('authority'),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    MintAccount: {
        freezeAuthority: resolveAccount('freezeAuthority'),
        mintAuthority: resolveAccount('mintAuthority'),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    TokenAccount: {
        mint: resolveAccount('mint'),
        owner: resolveAccount('owner'),
        ownerProgram: resolveAccount('ownerProgram'),
    },
    StakeAccountDataMetaAuthorized: {
        staker: resolveAccount('staker'),
        withdrawer: resolveAccount('withdrawer'),
    },
    StakeAccountDataMetaLockup: {
        custodian: resolveAccount('custodian'),
    },
    StakeAccountDataStakeDelegation: {
        voter: resolveAccount('voter'),
    },
    StakeAccount: {
        ownerProgram: resolveAccount('ownerProgram'),
    },
    VoteAccountDataAuthorizedVoter: {
        authorizedVoter: resolveAccount('authorizedVoter'),
    },
    VoteAccount: {
        authorizedWithdrawer: resolveAccount('authorizedWithdrawer'),
        node: resolveAccount('nodePubkey'),
        ownerProgram: resolveAccount('ownerProgram'),
    },
};
