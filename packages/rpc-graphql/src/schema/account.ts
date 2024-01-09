/* eslint-disable sort-keys-fix/sort-keys-fix */
import { resolveAccount, resolveAccountData } from '../resolvers/account';

export const accountTypeDefs = /* GraphQL */ `
    # Account interface
    interface Account {
        address: Address
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
        lamports: BigInt
        ownerProgram: Account
        space: BigInt
        rentEpoch: BigInt
    }

    type GenericAccount implements Account {
        address: Address
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
        lamports: BigInt
        ownerProgram: Account
        space: BigInt
        rentEpoch: BigInt
    }

    """
    An account whose data is an executable binary
    """
    type ProgramAccount implements Account {
        address: Address
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
        lamports: BigInt
        ownerProgram: Account
        space: BigInt
        rentEpoch: BigInt
    }

    """
    An special account with dynamically-updated data
    """
    type Sysvar implements Account {
        address: Address
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
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
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
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
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
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
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
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
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
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
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
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
        data(encoding: AccountEncoding!, dataSlice: DataSlice): String
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
        __resolveType(account: {
            address: string;
            encoding: string;
            executable?: boolean;
            lamports?: bigint;
            owner: string;
            programName: string;
            accountType: string;
        }) {
            if (
                account.owner === 'Sysvar1111111111111111111111111111111111111' ||
                account.address === 'Sysvar1nstructions1111111111111111111111111'
            ) {
                return 'Sysvar';
            }
            if (account.owner === 'NativeLoader1111111111111111111111111111111' || account.executable) {
                return 'ProgramAccount';
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
            return 'GenericAccount';
        },
    },
    GenericAccount: {
        data: resolveAccountData(),
        ownerProgram: resolveAccount('owner'),
    },
    NonceAccount: {
        data: resolveAccountData(),
        authority: resolveAccount('authority'),
        ownerProgram: resolveAccount('owner'),
    },
    LookupTableAccount: {
        data: resolveAccountData(),
        authority: resolveAccount('authority'),
        ownerProgram: resolveAccount('owner'),
    },
    MintAccount: {
        data: resolveAccountData(),
        freezeAuthority: resolveAccount('freezeAuthority'),
        mintAuthority: resolveAccount('mintAuthority'),
        ownerProgram: resolveAccount('owner'),
    },
    ProgramAccount: {
        data: resolveAccountData(),
        ownerProgram: resolveAccount('owner'),
    },
    TokenAccount: {
        data: resolveAccountData(),
        mint: resolveAccount('mint'),
        owner: resolveAccount('owner'),
        ownerProgram: resolveAccount('owner'),
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
        data: resolveAccountData(),
        ownerProgram: resolveAccount('owner'),
    },
    Sysvar: {
        data: resolveAccountData(),
        ownerProgram: resolveAccount('owner'),
    },
    VoteAccountDataAuthorizedVoter: {
        authorizedVoter: resolveAccount('authorizedVoter'),
    },
    VoteAccount: {
        data: resolveAccountData(),
        authorizedWithdrawer: resolveAccount('authorizedWithdrawer'),
        node: resolveAccount('nodePubkey'),
        ownerProgram: resolveAccount('owner'),
    },
};
