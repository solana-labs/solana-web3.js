import { GraphQLInterfaceType, GraphQLObjectType, GraphQLScalarType } from 'graphql';

import { accountEncodingInputType, commitmentInputType, dataSliceInputType } from '../inputs';
import { bigint, boolean, list, number, object, string, type } from '../picks';

let memoisedTokenAmountType: GraphQLObjectType | undefined;
export const tokenAmountType = () => {
    if (!memoisedTokenAmountType) {
        memoisedTokenAmountType = new GraphQLObjectType({
            fields: {
                amount: string(),
                decimals: number(),
                uiAmount: bigint(),
                uiAmountString: string(),
            },
            name: 'TokenAmount',
        });
    }
    return memoisedTokenAmountType;
};

let memoisedJsonParsedMeta: GraphQLObjectType | undefined;
export const jsonParsedMeta = () => {
    if (!memoisedJsonParsedMeta) {
        memoisedJsonParsedMeta = new GraphQLObjectType({
            fields: {
                program: string(),
                space: bigint(),
                type: string(),
            },
            name: 'JsonParsedMeta',
        });
    }
    return memoisedJsonParsedMeta;
};

/**
 * The fields of the account interface
 */
let memoisedAccountInterfaceFields: object | undefined;
const accountInterfaceFields = () => {
    if (!memoisedAccountInterfaceFields) {
        memoisedAccountInterfaceFields = {
            address: string(),
            encoding: string(),
            executable: boolean(),
            lamports: bigint(),
            rentEpoch: bigint(),
        };
    }
    return memoisedAccountInterfaceFields;
};

/**
 * An account interface for GraphQL
 */
let memoisedAccountInterface: GraphQLInterfaceType | undefined;
export const accountInterface = (): GraphQLInterfaceType => {
    if (!memoisedAccountInterface) {
        memoisedAccountInterface = new GraphQLInterfaceType({
            description: 'A Solana account',
            fields: () => ({
                ...accountInterfaceFields(),
                owner: type(accountInterface()),
            }),
            name: 'Account',
            resolveType(account) {
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
                    if (account.meta.type === 'mint' && account.meta.program === 'spl-token') {
                        return 'MintAccount';
                    }
                    if (account.meta.type === 'account' && account.meta.program === 'spl-token') {
                        return 'TokenAccount';
                    }
                    if (account.meta.program === 'nonce') {
                        return 'NonceAccount';
                    }
                    if (account.meta.program === 'stake') {
                        return 'StakeAccount';
                    }
                    if (account.meta.type === 'vote' && account.meta.program === 'vote') {
                        return 'VoteAccount';
                    }
                    if (account.meta.type === 'lookupTable' && account.meta.program === 'address-lookup-table') {
                        return 'LookupTableAccount';
                    }
                }
                return 'AccountBase64';
            },
        });
    }
    return memoisedAccountInterface;
};

/**
 * An account type implementing the account interface with a
 * specified data encoding structure
 * @param name          The name of the account type
 * @param description   The description of the account type
 * @param data          The data structure of the account type
 * @returns             The account type as a GraphQL object implementing the account interface
 */
const accountType = (
    name: string,
    description: string,
    data: { type: GraphQLScalarType | GraphQLObjectType },
    meta: boolean
): GraphQLObjectType => {
    const fieldsBase = {
        ...accountInterfaceFields(),
        data,
        // Nested Account interface
        owner: {
            args: {
                commitment: type(commitmentInputType()),
                dataSlice: type(dataSliceInputType()),
                encoding: type(accountEncodingInputType()),
                minContextSlot: bigint(),
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            resolve: (parent: any, args: any, context: any, info: any) =>
                context.resolveAccount({ ...args, address: parent.owner }, info),
            type: accountInterface(),
        },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const graphQLObject = (fields: any) =>
        new GraphQLObjectType({
            description,
            fields,
            interfaces: [accountInterface()],
            name,
        });
    return meta
        ? graphQLObject({
              ...fieldsBase,
              meta: type(jsonParsedMeta()),
          })
        : graphQLObject(fieldsBase);
};

let memoisedAccountBase58: GraphQLObjectType | undefined;
const accountBase58 = () => {
    if (!memoisedAccountBase58)
        memoisedAccountBase58 = accountType(
            'AccountBase58',
            'A Solana account with base58 encoded data',
            string(),
            false
        );
    return memoisedAccountBase58;
};

let memoisedAccountBase64: GraphQLObjectType | undefined;
const accountBase64 = () => {
    if (!memoisedAccountBase64)
        memoisedAccountBase64 = accountType(
            'AccountBase64',
            'A Solana account with base64 encoded data',
            string(),
            false
        );
    return memoisedAccountBase64;
};

let memoisedAccountBase64Zstd: GraphQLObjectType | undefined;
const accountBase64Zstd = () => {
    if (!memoisedAccountBase64Zstd)
        memoisedAccountBase64Zstd = accountType(
            'AccountBase64Zstd',
            'A Solana account with base64 encoded data compressed with zstd',
            string(),
            false
        );
    return memoisedAccountBase64Zstd;
};

let memoisedAccountNonceAccount: GraphQLObjectType | undefined;
const accountNonceAccount = () => {
    if (!memoisedAccountNonceAccount)
        memoisedAccountNonceAccount = accountType(
            'NonceAccount',
            'A nonce account',
            object('NonceData', {
                // Nested Account interface
                authority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.authority }, info),
                    type: accountInterface(),
                },
                blockhash: string(),
                feeCalculator: object('NonceFeeCalculator', {
                    lamportsPerSignature: string(),
                }),
            }),
            true
        );
    return memoisedAccountNonceAccount;
};

let memoisedAccountLookupTable: GraphQLObjectType | undefined;
const accountLookupTable = () => {
    if (!memoisedAccountLookupTable)
        memoisedAccountLookupTable = accountType(
            'LookupTableAccount',
            'An address lookup table account',
            object('LookupTableData', {
                addresses: list(string()),
                // Nested Account interface
                authority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.authority }, info),
                    type: accountInterface(),
                },
                deactivationSlot: string(),
                lastExtendedSlot: string(),
                lastExtendedSlotStartIndex: number(),
            }),
            true
        );
    return memoisedAccountLookupTable;
};

let memoisedAccountMint: GraphQLObjectType | undefined;
const accountMint = () => {
    if (!memoisedAccountMint)
        memoisedAccountMint = accountType(
            'MintAccount',
            'An SPL mint',
            object('MintData', {
                decimals: number(),
                freezeAuthority: string(),
                isInitialized: boolean(),
                // Nested Account interface
                mintAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.mintAuthority }, info),
                    type: accountInterface(),
                },
                supply: string(),
            }),
            true
        );
    return memoisedAccountMint;
};

let memoisedAccountTokenAccount: GraphQLObjectType | undefined;
const accountTokenAccount = () => {
    if (!memoisedAccountTokenAccount)
        memoisedAccountTokenAccount = accountType(
            'TokenAccount',
            'An SPL token account',
            object('TokenAccountData', {
                isNative: boolean(),
                mint: string(),
                // Nested Account interface
                owner: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.owner }, info),
                    type: accountInterface(),
                },
                state: string(),
                tokenAmount: type(tokenAmountType()),
            }),
            true
        );
    return memoisedAccountTokenAccount;
};

let memoisedAccountStakeAccount: GraphQLObjectType | undefined;
const accountStakeAccount = () => {
    if (!memoisedAccountStakeAccount)
        memoisedAccountStakeAccount = accountType(
            'StakeAccount',
            'A stake account',
            object('StakeData', {
                meta: object('StakeMeta', {
                    authorized: object('StakeMetaAuthorized', {
                        // Nested Account interface
                        staker: {
                            args: {
                                commitment: type(commitmentInputType()),
                                dataSlice: type(dataSliceInputType()),
                                encoding: type(accountEncodingInputType()),
                                minContextSlot: bigint(),
                            },
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            resolve: (parent: any, args, context: any, info) =>
                                context.resolveAccount({ ...args, address: parent.staker }, info),
                            type: accountInterface(),
                        },
                        // Nested Account interface
                        withdrawer: {
                            args: {
                                commitment: type(commitmentInputType()),
                                dataSlice: type(dataSliceInputType()),
                                encoding: type(accountEncodingInputType()),
                                minContextSlot: bigint(),
                            },
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            resolve: (parent: any, args, context: any, info) =>
                                context.resolveAccount({ ...args, address: parent.withdrawer }, info),
                            type: accountInterface(),
                        },
                    }),
                    lockup: object('StakeMetaLockup', {
                        // Nested Account interface
                        custodian: {
                            args: {
                                commitment: type(commitmentInputType()),
                                dataSlice: type(dataSliceInputType()),
                                encoding: type(accountEncodingInputType()),
                                minContextSlot: bigint(),
                            },
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            resolve: (parent: any, args, context: any, info) =>
                                context.resolveAccount({ ...args, address: parent.custodian }, info),
                            type: accountInterface(),
                        },
                        epoch: bigint(),
                        unixTimestamp: bigint(),
                    }),
                    rentExemptReserve: string(),
                }),
                stake: object('StakeStake', {
                    creditsObserved: bigint(),
                    delegation: object('StakeStakeDelegation', {
                        activationEpoch: bigint(),
                        deactivationEpoch: bigint(),
                        stake: string(),
                        // Nested Account interface
                        voter: {
                            args: {
                                commitment: type(commitmentInputType()),
                                dataSlice: type(dataSliceInputType()),
                                encoding: type(accountEncodingInputType()),
                                minContextSlot: bigint(),
                            },
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            resolve: (parent: any, args, context: any, info) =>
                                context.resolveAccount({ ...args, address: parent.voter }, info),
                            type: accountInterface(),
                        },
                        warmupCooldownRate: number(),
                    }),
                }),
            }),
            true
        );
    return memoisedAccountStakeAccount;
};

let memoisedAccountVoteAccount: GraphQLObjectType | undefined;
const accountVoteAccount = () => {
    if (!memoisedAccountVoteAccount)
        memoisedAccountVoteAccount = accountType(
            'VoteAccount',
            'A vote account',
            object('VoteData', {
                authorizedVoters: list(
                    object('VoteAuthorizedVoter', {
                        // Nested Account interface
                        authorizedVoter: {
                            args: {
                                commitment: type(commitmentInputType()),
                                dataSlice: type(dataSliceInputType()),
                                encoding: type(accountEncodingInputType()),
                                minContextSlot: bigint(),
                            },
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            resolve: (parent: any, args, context: any, info) =>
                                context.resolveAccount({ ...args, address: parent.authorizedVoter }, info),
                            type: accountInterface(),
                        },
                        epoch: bigint(),
                    })
                ),
                // Nested Account interface
                authorizedWithdrawer: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.authorizedWithdrawer }, info),
                    type: accountInterface(),
                },
                commission: number(),
                epochCredits: list(
                    object('VoteEpochCredits', {
                        credits: string(),
                        epoch: bigint(),
                        previousCredits: string(),
                    })
                ),
                lastTimestamp: object('VoteLastTimestamp', {
                    slot: bigint(),
                    timestamp: bigint(),
                }),
                // Nested Account interface
                node: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.nodePubkey }, info),
                    type: accountInterface(),
                },
                priorVoters: list(string()),
                rootSlot: bigint(),
                votes: list(
                    object('VoteVote', {
                        confirmationCount: number(),
                        slot: bigint(),
                    })
                ),
            }),
            true
        );
    return memoisedAccountVoteAccount;
};

let memoisedAccountTypes: GraphQLObjectType[] | undefined;
export const accountTypes = () => {
    if (!memoisedAccountTypes)
        memoisedAccountTypes = [
            accountBase58(),
            accountBase64(),
            accountBase64Zstd(),
            accountNonceAccount(),
            accountLookupTable(),
            accountMint(),
            accountTokenAccount(),
            accountStakeAccount(),
            accountVoteAccount(),
        ];
    return memoisedAccountTypes;
};
