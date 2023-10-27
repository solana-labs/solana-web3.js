import { GraphQLInterfaceType, GraphQLList, GraphQLObjectType, GraphQLScalarType, GraphQLUnionType } from 'graphql';

import { accountInterface } from '../account';
import { accountEncodingInputType, commitmentInputType, dataSliceInputType } from '../inputs';
import { bigint, boolean, list, number, object, string, type } from '../picks';

let memoisedTokenBalance: GraphQLObjectType | undefined;
export const tokenBalance = () => {
    if (!memoisedTokenBalance)
        memoisedTokenBalance = new GraphQLObjectType({
            fields: {
                accountIndex: number(),
                // Nested Account interface
                mint: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.mint }, info),
                    type: accountInterface(),
                },
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
                programId: string(),
                uiAmountString: string(),
            },
            name: 'TokenBalance',
        });
    return memoisedTokenBalance;
};

let memoisedTransactionStatus: GraphQLUnionType | undefined;
export const transactionStatus = () => {
    if (!memoisedTransactionStatus)
        memoisedTransactionStatus = new GraphQLUnionType({
            name: 'TransactionStatus',
            types: [
                new GraphQLObjectType({
                    fields: {
                        Err: string(),
                    },
                    name: 'TransactionStatusError',
                }),
                new GraphQLObjectType({
                    fields: {
                        Ok: string(),
                    },
                    name: 'TransactionStatusOk',
                }),
            ],
        });
    return memoisedTransactionStatus;
};

let memoisedReward: GraphQLObjectType | undefined;
export const reward = () => {
    if (!memoisedReward)
        memoisedReward = new GraphQLObjectType({
            fields: {
                commission: number(),
                lamports: bigint(),
                postBalance: bigint(),
                pubkey: string(),
                rewardType: string(),
            },
            name: 'Reward',
        });
    return memoisedReward;
};

let memoisedAddressTableLookup: GraphQLObjectType | undefined;
const addressTableLookup = () => {
    if (!memoisedAddressTableLookup)
        memoisedAddressTableLookup = new GraphQLObjectType({
            fields: {
                accountKey: string(),
                readableIndexes: list(number()),
                writableIndexes: list(number()),
            },
            name: 'AddressTableLookup',
        });
    return memoisedAddressTableLookup;
};

let memoisedReturnData: GraphQLObjectType | undefined;
export const returnData = () => {
    if (!memoisedReturnData)
        memoisedReturnData = new GraphQLObjectType({
            fields: {
                data: string(),
                programId: string(),
            },
            name: 'ReturnData',
        });
    return memoisedReturnData;
};

let memoisedTransactionInstruction: GraphQLObjectType | undefined;
const transactionInstruction = () => {
    if (!memoisedTransactionInstruction)
        memoisedTransactionInstruction = new GraphQLObjectType({
            fields: {
                accounts: list(number()),
                data: string(),
                programIdIndex: number(),
            },
            name: 'TransactionInstruction',
        });
    return memoisedTransactionInstruction;
};

let memoisedTransactionMetaLoadedAddresses: GraphQLObjectType | undefined;
export const transactionMetaLoadedAddresses = () => {
    if (!memoisedTransactionMetaLoadedAddresses)
        memoisedTransactionMetaLoadedAddresses = new GraphQLObjectType({
            fields: {
                readonly: list(string()), // Base58 encoded addresses
                writable: list(string()), // Base58 encoded addresses
            },
            name: 'TransactionMetaLoadedAddresses',
        });
    return memoisedTransactionMetaLoadedAddresses;
};

let memoisedParsedTransactionInstructionInterface: GraphQLInterfaceType | undefined;
/**
 * Interface for a parsed transaction instruction
 */
const parsedTransactionInstructionInterface = () => {
    if (!memoisedParsedTransactionInstructionInterface)
        memoisedParsedTransactionInstructionInterface = new GraphQLInterfaceType({
            fields: {
                programId: string(),
            },
            name: 'ParsedTransactionInstruction',
            resolveType(instruction) {
                if (instruction.program === 'address-lookup-table') {
                    if (instruction.info.type === 'createLookupTable') {
                        return 'CreateLookupTableInstruction';
                    }
                    if (instruction.info.type === 'freezeLookupTable') {
                        return 'FreezeLookupTableInstruction';
                    }
                    if (instruction.info.type === 'extendLookupTable') {
                        return 'ExtendLookupTableInstruction';
                    }
                    if (instruction.info.type === 'deactivateLookupTable') {
                        return 'DeactivateLookupTableInstruction';
                    }
                    if (instruction.info.type === 'closeLookupTable') {
                        return 'CloseLookupTableInstruction';
                    }
                }
                if (instruction.program === 'bpf-loader') {
                    if (instruction.info.type === 'write') {
                        return 'BpfLoaderWriteInstruction';
                    }
                    if (instruction.info.type === 'finalize') {
                        return 'BpfLoaderFinalizeInstruction';
                    }
                }
                if (instruction.program === 'bpf-upgradeable-loader') {
                    if (instruction.info.type === 'initializeBuffer') {
                        return 'BpfUpgradeableLoaderInitializeBufferInstruction';
                    }
                    if (instruction.info.type === 'write') {
                        return 'BpfUpgradeableLoaderWriteInstruction';
                    }
                    if (instruction.info.type === 'deployWithMaxDataLen') {
                        return 'BpfUpgradeableLoaderDeployWithMaxDataLenInstruction';
                    }
                    if (instruction.info.type === 'upgrade') {
                        return 'BpfUpgradeableLoaderUpgradeInstruction';
                    }
                    if (instruction.info.type === 'setAuthority') {
                        return 'BpfUpgradeableLoaderSetAuthorityInstruction';
                    }
                    if (instruction.info.type === 'setAuthorityChecked') {
                        return 'BpfUpgradeableLoaderSetAuthorityCheckedInstruction';
                    }
                    if (instruction.info.type === 'close') {
                        return 'BpfUpgradeableLoaderCloseInstruction';
                    }
                    if (instruction.info.type === 'extendProgram') {
                        return 'BpfUpgradeableLoaderExtendProgramInstruction';
                    }
                }
                if (instruction.program === 'spl-associated-token-account') {
                    if (instruction.info.type === 'create') {
                        return 'SplAssociatedTokenCreateInstruction';
                    }
                    if (instruction.info.type === 'createIdempotent') {
                        return 'SplAssociatedTokenCreateIdempotentInstruction';
                    }
                    if (instruction.info.type === 'recoverNested') {
                        return 'SplAssociatedTokenRecoverNestedInstruction';
                    }
                }
                if (instruction.program === 'spl-memo') {
                    return 'SplMemoInstruction';
                }
                if (instruction.program === 'spl-token') {
                    if (instruction.info.type === 'initializeMint') {
                        return 'SplTokenInitializeMintInstruction';
                    }
                    if (instruction.info.type === 'initializeMint2') {
                        return 'SplTokenInitializeMint2Instruction';
                    }
                    if (instruction.info.type === 'initializeAccount') {
                        return 'SplTokenInitializeAccountInstruction';
                    }
                    if (instruction.info.type === 'initializeAccount2') {
                        return 'SplTokenInitializeAccount2Instruction';
                    }
                    if (instruction.info.type === 'initializeAccount3') {
                        return 'SplTokenInitializeAccount3Instruction';
                    }
                    if (instruction.info.type === 'initializeMultisig') {
                        return 'SplTokenInitializeMultisigInstruction';
                    }
                    if (instruction.info.type === 'initializeMultisig2') {
                        return 'SplTokenInitializeMultisig2Instruction';
                    }
                    if (instruction.info.type === 'transfer') {
                        return 'SplTokenTransferInstruction';
                    }
                    if (instruction.info.type === 'approve') {
                        return 'SplTokenApproveInstruction';
                    }
                    if (instruction.info.type === 'revoke') {
                        return 'SplTokenRevokeInstruction';
                    }
                    if (instruction.info.type === 'setAuthority') {
                        return 'SplTokenSetAuthorityInstruction';
                    }
                    if (instruction.info.type === 'mintTo') {
                        return 'SplTokenMintToInstruction';
                    }
                    if (instruction.info.type === 'burn') {
                        return 'SplTokenBurnInstruction';
                    }
                    if (instruction.info.type === 'closeAccount') {
                        return 'SplTokenCloseAccountInstruction';
                    }
                    if (instruction.info.type === 'freezeAccount') {
                        return 'SplTokenFreezeAccountInstruction';
                    }
                    if (instruction.info.type === 'thawAccount') {
                        return 'SplTokenThawAccountInstruction';
                    }
                    if (instruction.info.type === 'transferChecked') {
                        return 'SplTokenTransferCheckedInstruction';
                    }
                    if (instruction.info.type === 'approveChecked') {
                        return 'SplTokenApproveCheckedInstruction';
                    }
                    if (instruction.info.type === 'mintToChecked') {
                        return 'SplTokenMintToCheckedInstruction';
                    }
                    if (instruction.info.type === 'burnChecked') {
                        return 'SplTokenBurnCheckedInstruction';
                    }
                    if (instruction.info.type === 'syncNative') {
                        return 'SplTokenSyncNativeInstruction';
                    }
                    if (instruction.info.type === 'getAccountDataSize') {
                        return 'SplTokenGetAccountDataSizeInstruction';
                    }
                    if (instruction.info.type === 'initializeImmutableOwner') {
                        return 'SplTokenInitializeImmutableOwnerInstruction';
                    }
                    if (instruction.info.type === 'amountToUiAmount') {
                        return 'SplTokenAmountToUiAmountInstruction';
                    }
                    if (instruction.info.type === 'uiAmountToAmount') {
                        return 'SplTokenUiAmountToAmountInstruction';
                    }
                    if (instruction.info.type === 'initializeMintCloseAuthority') {
                        return 'SplTokenInitializeMintCloseAuthorityInstruction';
                    }
                }
                if (instruction.program === 'stake') {
                    if (instruction.info.type === 'initialize') {
                        return 'StakeInitializeInstruction';
                    }
                    if (instruction.info.type === 'authorize') {
                        return 'StakeAuthorizeInstruction';
                    }
                    if (instruction.info.type === 'delegate') {
                        return 'StakeDelegateStakeInstruction';
                    }
                    if (instruction.info.type === 'split') {
                        return 'StakeSplitInstruction';
                    }
                    if (instruction.info.type === 'withdraw') {
                        return 'StakeWithdrawInstruction';
                    }
                    if (instruction.info.type === 'deactivate') {
                        return 'StakeDeactivateInstruction';
                    }
                    if (instruction.info.type === 'setLockup') {
                        return 'StakeSetLockupInstruction';
                    }
                    if (instruction.info.type === 'merge') {
                        return 'StakeMergeInstruction';
                    }
                    if (instruction.info.type === 'authorizeWithSeed') {
                        return 'StakeAuthorizeWithSeedInstruction';
                    }
                    if (instruction.info.type === 'initializeChecked') {
                        return 'StakeInitializeCheckedInstruction';
                    }
                    if (instruction.info.type === 'authorizeChecked') {
                        return 'StakeAuthorizeCheckedInstruction';
                    }
                    if (instruction.info.type === 'authorizeCheckedWithSeed') {
                        return 'StakeAuthorizeCheckedWithSeedInstruction';
                    }
                    if (instruction.info.type === 'setLockupChecked') {
                        return 'StakeSetLockupCheckedInstruction';
                    }
                    if (instruction.info.type === 'deactivateDelinquent') {
                        return 'StakeDeactivateDelinquentInstruction';
                    }
                    if (instruction.info.type === 'redelegate') {
                        return 'StakeRedelegateInstruction';
                    }
                }
                if (instruction.program === 'system') {
                    if (instruction.info.type === 'createAccount') {
                        return 'CreateAccountInstruction';
                    }
                    if (instruction.info.type === 'assign') {
                        return 'AssignInstruction';
                    }
                    if (instruction.info.type === 'transfer') {
                        return 'TransferInstruction';
                    }
                    if (instruction.info.type === 'createAccountWithSeed') {
                        return 'CreateAccountWithSeedInstruction';
                    }
                    if (instruction.info.type === 'advanceNonceAccount') {
                        return 'AdvanceNonceAccountInstruction';
                    }
                    if (instruction.info.type === 'withdrawNonceAccount') {
                        return 'WithdrawNonceAccountInstruction';
                    }
                    if (instruction.info.type === 'initializeNonceAccount') {
                        return 'InitializeNonceAccountInstruction';
                    }
                    if (instruction.info.type === 'authorizeNonceAccount') {
                        return 'AuthorizeNonceAccountInstruction';
                    }
                    if (instruction.info.type === 'upgradeNonceAccount') {
                        return 'UpgradeNonceAccountInstruction';
                    }
                    if (instruction.info.type === 'allocate') {
                        return 'AllocateInstruction';
                    }
                    if (instruction.info.type === 'allocateWithSeed') {
                        return 'AllocateWithSeedInstruction';
                    }
                    if (instruction.info.type === 'assignWithSeed') {
                        return 'AssignWithSeedInstruction';
                    }
                    if (instruction.info.type === 'transferWithSeed') {
                        return 'TransferWithSeedInstruction';
                    }
                }
                if (instruction.program === 'vote') {
                    if (instruction.info.type === 'initialize') {
                        return 'VoteInitializeAccountInstruction';
                    }
                    if (instruction.info.type === 'authorize') {
                        return 'VoteAuthorizeInstruction';
                    }
                    if (instruction.info.type === 'authorizeWithSeed') {
                        return 'VoteAuthorizeWithSeedInstruction';
                    }
                    if (instruction.info.type === 'authorizeCheckedWithSeed') {
                        return 'VoteAuthorizeCheckedWithSeedInstruction';
                    }
                    if (instruction.info.type === 'vote') {
                        return 'VoteVoteInstruction';
                    }
                    if (instruction.info.type === 'updatevotestate') {
                        return 'VoteUpdateVoteStateInstruction';
                    }
                    if (instruction.info.type === 'updatevotestateswitch') {
                        return 'VoteUpdateVoteStateSwitchInstruction';
                    }
                    if (instruction.info.type === 'compactupdatevotestate') {
                        return 'VoteCompactUpdateVoteStateInstruction';
                    }
                    if (instruction.info.type === 'compactupdatevotestateswitch') {
                        return 'VoteCompactUpdateVoteStateSwitchInstruction';
                    }
                    if (instruction.info.type === 'withdraw') {
                        return 'VoteWithdrawInstruction';
                    }
                    if (instruction.info.type === 'updateValidatorIdentity') {
                        return 'VoteUpdateValidatorIdentityInstruction';
                    }
                    if (instruction.info.type === 'updateCommission') {
                        return 'VoteUpdateCommissionInstruction';
                    }
                    if (instruction.info.type === 'voteSwitch') {
                        return 'VoteVoteSwitchInstruction';
                    }
                    if (instruction.info.type === 'authorizeChecked') {
                        return 'VoteAuthorizeCheckedInstruction';
                    }
                }
                return 'PartiallyDecodedInstruction';
            },
        });
    return memoisedParsedTransactionInstructionInterface;
};

/**
 * Builds JSON parsed instruction
 * Note: JSON parsed data is only available for instructions with known schemas.
 * Any instruction with an unknown schema will return as a partially decoded transaction
 * with base64 encoded data.
 * @see https://docs.solana.com/api/http#parsed-responses
 * @param name              The name of the instruction type
 * @param parsedInfoFields  The fields of the parsed info object
 * @returns                 The JSON parsed instruction as a GraphQL object
 */
const parsedTransactionInstructionType = (name: string, parsedInfoFields: Parameters<typeof object>[1]) =>
    new GraphQLObjectType({
        fields: {
            parsed: object(name + 'Parsed', {
                info: object(name + 'ParsedInfo', parsedInfoFields),
                type: string(),
            }),
            program: string(),
            programId: string(),
        },
        interfaces: [parsedTransactionInstructionInterface()],
        name,
    });

let memoisedPartiallyDecodedTransactionInstruction: GraphQLObjectType | undefined;
const partiallyDecodedTransactionInstruction = () => {
    if (!memoisedPartiallyDecodedTransactionInstruction)
        memoisedPartiallyDecodedTransactionInstruction = new GraphQLObjectType({
            fields: {
                accounts: list(string()),
                data: string(),
                programId: string(),
            },
            interfaces: [parsedTransactionInstructionInterface()],
            name: 'PartiallyDecodedInstruction',
        });
    return memoisedPartiallyDecodedTransactionInstruction;
};

let memoisedParsedInstructionsAddressLookupTable: GraphQLObjectType[] | undefined;
/**
 * Address Lookup Table program
 * @see https://github.com/solana-labs/solana/blob/7afb11f1e6daa3e9bd93cfe203211de5b14ba56a/transaction-status/src/parse_address_lookup_table.rs#L13
 */
const parsedInstructionsAddressLookupTable = () => {
    if (!memoisedParsedInstructionsAddressLookupTable)
        memoisedParsedInstructionsAddressLookupTable = [
            parsedTransactionInstructionType('CreateLookupTableInstruction', {
                bumpSeed: number(),
                // Nested Account interface
                lookupTableAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.lookupTableAccount }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                lookupTableAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.lookupTableAuthority }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                payerAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.payerAccount }, info),
                    type: accountInterface(),
                },
                recentSlot: bigint(),
                // Nested Account interface
                systemProgram: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.systemProgram }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('FreezeLookupTableInstruction', {
                // Nested Account interface
                lookupTableAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.lookupTableAccount }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                lookupTableAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.lookupTableAuthority }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('ExtendLookupTableInstruction', {
                // Nested Account interface
                lookupTableAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.lookupTableAccount }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                lookupTableAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.lookupTableAuthority }, info),
                    type: accountInterface(),
                },
                newAddresses: list(string()),
                // Nested Account interface
                payerAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.payerAccount }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                systemProgram: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.systemProgram }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('DeactivateLookupTableInstruction', {
                // Nested Account interface
                lookupTableAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.lookupTableAccount }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                lookupTableAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.lookupTableAuthority }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('CloseLookupTableInstruction', {
                // Nested Account interface
                lookupTableAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.lookupTableAccount }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                lookupTableAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.lookupTableAuthority }, info),
                    type: accountInterface(),
                },
                recipient: string(),
            }),
        ];
    return memoisedParsedInstructionsAddressLookupTable;
};

let memoisedParsedInstructionsBpfLoader: GraphQLObjectType[] | undefined;
/**
 * BPF Loader program
 * @see https://github.com/solana-labs/solana/blob/7afb11f1e6daa3e9bd93cfe203211de5b14ba56a/transaction-status/src/parse_bpf_loader.rs#L14
 */
const parsedInstructionsBpfLoader = () => {
    if (!memoisedParsedInstructionsBpfLoader)
        memoisedParsedInstructionsBpfLoader = [
            parsedTransactionInstructionType('BpfLoaderWriteInstruction', {
                // Nested Account interface
                account: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.account }, info),
                    type: accountInterface(),
                },
                bytes: string(),
                offset: number(),
            }),
            parsedTransactionInstructionType('BpfLoaderFinalizeInstruction', {
                // Nested Account interface
                account: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.account }, info),
                    type: accountInterface(),
                },
            }),
        ];
    return memoisedParsedInstructionsBpfLoader;
};

let memoisedParsedInstructionsBpfUpgradeableLoader: GraphQLObjectType[] | undefined;
/**
 * BPF Upgradeable Loader program
 * @see https://github.com/solana-labs/solana/blob/7afb11f1e6daa3e9bd93cfe203211de5b14ba56a/transaction-status/src/parse_bpf_loader.rs#L49
 */
const parsedInstructionsBpfUpgradeableLoader = () => {
    if (!memoisedParsedInstructionsBpfUpgradeableLoader)
        memoisedParsedInstructionsBpfUpgradeableLoader = [
            parsedTransactionInstructionType('BpfUpgradeableLoaderInitializeBufferInstruction', {
                // Nested Account interface
                account: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.account }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('BpfUpgradeableLoaderWriteInstruction', {
                // Nested Account interface
                account: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.account }, info),
                    type: accountInterface(),
                },
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
                bytes: string(),
                offset: number(),
            }),
            parsedTransactionInstructionType('BpfUpgradeableLoaderDeployWithMaxDataLenInstruction', {
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
                // Nested Account interface
                bufferAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.bufferAccount }, info),
                    type: accountInterface(),
                },
                clockSysvar: string(),
                maxDataLen: bigint(),
                // Nested Account interface
                payerAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.payerAccount }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                programAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.programAccount }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                programDataAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.programDataAccount }, info),
                    type: accountInterface(),
                },
                rentSysvar: string(),
            }),
            parsedTransactionInstructionType('BpfUpgradeableLoaderUpgradeInstruction', {
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
                // Nested Account interface
                bufferAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.bufferAccount }, info),
                    type: accountInterface(),
                },
                clockSysvar: string(),
                // Nested Account interface
                programAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.programAccount }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                programDataAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.programDataAccount }, info),
                    type: accountInterface(),
                },
                rentSysvar: string(),
                // Nested Account interface
                spillAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.spillAccount }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('BpfUpgradeableLoaderSetAuthorityInstruction', {
                account: string(),
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
                // Nested Account interface
                newAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.newAuthority }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('BpfUpgradeableLoaderSetAuthorityCheckedInstruction', {
                // Nested Account interface
                account: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.account }, info),
                    type: accountInterface(),
                },
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
                // Nested Account interface
                newAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.newAuthority }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('BpfUpgradeableLoaderCloseInstruction', {
                // Nested Account interface
                account: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.account }, info),
                    type: accountInterface(),
                },
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
                // Nested Account interface
                programAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.programAccount }, info),
                    type: accountInterface(),
                },
                recipient: string(),
            }),
            parsedTransactionInstructionType('BpfUpgradeableLoaderExtendProgramInstruction', {
                additionalBytes: bigint(),
                payerAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.payerAccount }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                programAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.programAccount }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                programDataAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.programDataAccount }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                systemProgram: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.systemProgram }, info),
                    type: accountInterface(),
                },
            }),
        ];
    return memoisedParsedInstructionsBpfUpgradeableLoader;
};

let memoisedParsedInstructionsSplAssociatedToken: GraphQLObjectType[] | undefined;
/**
 * SPL Associated Token Account program
 * @see https://github.com/solana-labs/solana/blob/1a2c0943db6519dc9519bfc74c2426332ba26850/transaction-status/src/parse_associated_token.rs#L17
 */
const parsedInstructionsSplAssociatedToken = () => {
    if (!memoisedParsedInstructionsSplAssociatedToken)
        memoisedParsedInstructionsSplAssociatedToken = [
            parsedTransactionInstructionType('SplAssociatedTokenCreateInstruction', {
                // Nested Account interface
                account: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.account }, info),
                    type: accountInterface(),
                },
                mint: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.mint }, info),
                    type: accountInterface(),
                },
                source: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.source }, info),
                    type: accountInterface(),
                },
                systemProgram: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.systemProgram }, info),
                    type: accountInterface(),
                },
                tokenProgram: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.tokenProgram }, info),
                    type: accountInterface(),
                },
                wallet: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.wallet }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('SplAssociatedTokenCreateIdempotentInstruction', {
                // Nested Account interface
                account: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.account }, info),
                    type: accountInterface(),
                },
                mint: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.mint }, info),
                    type: accountInterface(),
                },
                source: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.source }, info),
                    type: accountInterface(),
                },
                systemProgram: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.systemProgram }, info),
                    type: accountInterface(),
                },
                tokenProgram: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.tokenProgram }, info),
                    type: accountInterface(),
                },
                wallet: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.wallet }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('SplAssociatedTokenRecoverNestedInstruction', {
                destination: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.destination }, info),
                    type: accountInterface(),
                },
                nestedMint: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.nestedMint }, info),
                    type: accountInterface(),
                },
                nestedOwner: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.nestedOwner }, info),
                    type: accountInterface(),
                },
                nestedSource: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.nestedSource }, info),
                    type: accountInterface(),
                },
                ownerMint: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.ownerMint }, info),
                    type: accountInterface(),
                },
                tokenProgram: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.tokenProgram }, info),
                    type: accountInterface(),
                },
                wallet: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.wallet }, info),
                    type: accountInterface(),
                },
            }),
        ];
    return memoisedParsedInstructionsSplAssociatedToken;
};

let memoisedParsedInstructionSplMemo: GraphQLObjectType | undefined;
/**
 * SPL Memo program
 * @see https://github.com/solana-labs/solana/blob/1a2c0943db6519dc9519bfc74c2426332ba26850/transaction-status/src/parse_instruction.rs#L146
 */
const parsedInstructionSplMemo = () => {
    if (!memoisedParsedInstructionSplMemo)
        memoisedParsedInstructionSplMemo = new GraphQLObjectType({
            fields: {
                parsed: string(),
                program: string(),
                programId: string(),
            },
            interfaces: [parsedTransactionInstructionInterface()],
            name: 'SplMemoInstruction',
        });
    return memoisedParsedInstructionSplMemo;
};

let memoisedParsedInstructionsSplToken: GraphQLObjectType[] | undefined;
/**
 * SPL Token program
 * @see https://github.com/solana-labs/solana/blob/d74de6780e2975472796a6a752b362152cd008a6/transaction-status/src/parse_token.rs#L29
 */
const parsedInstructionsSplToken = () => {
    if (!memoisedParsedInstructionsSplToken)
        memoisedParsedInstructionsSplToken = [
            parsedTransactionInstructionType('SplTokenInitializeMintInstruction', {
                decimals: number(),
                freezeAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.freezeAuthority }, info),
                    type: accountInterface(),
                },
                mint: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.mint }, info),
                    type: accountInterface(),
                },
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
                rentSysvar: string(),
            }),
            parsedTransactionInstructionType('SplTokenInitializeMint2Instruction', {
                decimals: number(),
                freezeAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.freezeAuthority }, info),
                    type: accountInterface(),
                },
                mint: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.mint }, info),
                    type: accountInterface(),
                },
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
            }),
            parsedTransactionInstructionType('SplTokenInitializeAccountInstruction', {
                // Nested Account interface
                account: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.account }, info),
                    type: accountInterface(),
                },
                mint: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.mint }, info),
                    type: accountInterface(),
                },
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
                rentSysvar: string(),
            }),
            parsedTransactionInstructionType('SplTokenInitializeAccount2Instruction', {
                // Nested Account interface
                account: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.account }, info),
                    type: accountInterface(),
                },
                mint: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.mint }, info),
                    type: accountInterface(),
                },
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
                rentSysvar: string(),
            }),
            parsedTransactionInstructionType('SplTokenInitializeAccount3Instruction', {
                // Nested Account interface
                account: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.account }, info),
                    type: accountInterface(),
                },
                mint: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.mint }, info),
                    type: accountInterface(),
                },
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
            }),
            parsedTransactionInstructionType('SplTokenInitializeMultisigInstruction', {
                m: number(),
                // Nested Account interface
                multisig: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.multisig }, info),
                    type: accountInterface(),
                },
                rentSysvar: string(),
                signers: list(string()),
            }),
            parsedTransactionInstructionType('SplTokenInitializeMultisig2Instruction', {
                m: number(),
                // Nested Account interface
                multisig: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.multisig }, info),
                    type: accountInterface(),
                },
                signers: list(string()),
            }),
            parsedTransactionInstructionType('SplTokenTransferInstruction', {
                amount: string(),
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
                destination: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.destination }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                multisigAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.multisigAuthority }, info),
                    type: accountInterface(),
                },
                source: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.source }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('SplTokenApproveInstruction', {
                amount: string(),
                // Nested Account interface
                delegate: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.delegate }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                multisigOwner: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.multisigOwner }, info),
                    type: accountInterface(),
                },
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
                source: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.source }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('SplTokenRevokeInstruction', {
                // Nested Account interface
                multisigOwner: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.multisigOwner }, info),
                    type: accountInterface(),
                },
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
                source: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.source }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('SplTokenSetAuthorityInstruction', {
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
                authorityType: string(),
                // Nested Account interface
                multisigAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.multisigAuthority }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                newAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.newAuthority }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('SplTokenMintToInstruction', {
                // Nested Account interface
                account: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.account }, info),
                    type: accountInterface(),
                },
                amount: string(),
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
                mint: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.mint }, info),
                    type: accountInterface(),
                },
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
                // Nested Account interface
                multisigMintAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.multisigMintAuthority }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('SplTokenBurnInstruction', {
                // Nested Account interface
                account: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.account }, info),
                    type: accountInterface(),
                },
                amount: string(),
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
                mint: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.mint }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                multisigAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.multisigAuthority }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('SplTokenCloseAccountInstruction', {
                // Nested Account interface
                account: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.account }, info),
                    type: accountInterface(),
                },
                destination: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.destination }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                multisigOwner: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.multisigOwner }, info),
                    type: accountInterface(),
                },
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
            }),
            parsedTransactionInstructionType('SplTokenFreezeAccountInstruction', {
                // Nested Account interface
                account: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.account }, info),
                    type: accountInterface(),
                },
                freezeAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.freezeAuthority }, info),
                    type: accountInterface(),
                },
                mint: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.mint }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                multisigFreezeAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.multisigFreezeAuthority }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('SplTokenThawAccountInstruction', {
                // Nested Account interface
                account: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.account }, info),
                    type: accountInterface(),
                },
                freezeAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.freezeAuthority }, info),
                    type: accountInterface(),
                },
                mint: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.mint }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                multisigFreezeAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.multisigFreezeAuthority }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('SplTokenTransferCheckedInstruction', {
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
                destination: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.destination }, info),
                    type: accountInterface(),
                },
                mint: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.mint }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                multisigAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.multisigAuthority }, info),
                    type: accountInterface(),
                },
                source: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.source }, info),
                    type: accountInterface(),
                },
                tokenAmount: string(),
            }),
            parsedTransactionInstructionType('SplTokenApproveCheckedInstruction', {
                // Nested Account interface
                delegate: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.delegate }, info),
                    type: accountInterface(),
                },
                mint: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.mint }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                multisigOwner: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.multisigOwner }, info),
                    type: accountInterface(),
                },
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
                source: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.source }, info),
                    type: accountInterface(),
                },
                tokenAmount: string(),
            }),
            parsedTransactionInstructionType('SplTokenMintToCheckedInstruction', {
                // Nested Account interface
                account: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.account }, info),
                    type: accountInterface(),
                },
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
                mint: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.mint }, info),
                    type: accountInterface(),
                },
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
                // Nested Account interface
                multisigMintAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.multisigMintAuthority }, info),
                    type: accountInterface(),
                },
                tokenAmount: string(),
            }),
            parsedTransactionInstructionType('SplTokenBurnCheckedInstruction', {
                // Nested Account interface
                account: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.account }, info),
                    type: accountInterface(),
                },
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
                mint: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.mint }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                multisigAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.multisigAuthority }, info),
                    type: accountInterface(),
                },
                tokenAmount: string(),
            }),
            parsedTransactionInstructionType('SplTokenSyncNativeInstruction', {
                // Nested Account interface
                account: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.account }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('SplTokenGetAccountDataSizeInstruction', {
                extensionTypes: list(string()),
                mint: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.mint }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('SplTokenInitializeImmutableOwnerInstruction', {
                // Nested Account interface
                account: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.account }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('SplTokenAmountToUiAmountInstruction', {
                amount: string(),
                mint: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.mint }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('SplTokenUiAmountToAmountInstruction', {
                mint: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.mint }, info),
                    type: accountInterface(),
                },
                uiAmount: string(),
            }),
            parsedTransactionInstructionType('SplTokenInitializeMintCloseAuthorityInstruction', {
                mint: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.mint }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                newAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.newAuthority }, info),
                    type: accountInterface(),
                },
            }),
            // TODO: Extensions!
            // - TransferFeeExtension
            // - ConfidentialTransferFeeExtension
            // - DefaultAccountStateExtension
            // - Reallocate
            // - MemoTransferExtension
            // - CreateNativeMint
            // - InitializeNonTransferableMint
            // - InterestBearingMintExtension
            // - CpiGuardExtension
            // - InitializePermanentDelegate
            // - TransferHookExtension
            // - ConfidentialTransferFeeExtension
            // - WithdrawExcessLamports
            // - MetadataPointerExtension
        ];
    return memoisedParsedInstructionsSplToken;
};

let memoisedLockup: GraphQLObjectType | undefined;
const lockup = () => {
    if (!memoisedLockup)
        memoisedLockup = new GraphQLObjectType({
            fields: {
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
            },
            name: 'Lockup',
        });
    return memoisedLockup;
};

let memoisedParsedInstructionsStake: GraphQLObjectType[] | undefined;
/**
 * Stake program
 * @see https://github.com/solana-labs/solana/blob/7afb11f1e6daa3e9bd93cfe203211de5b14ba56a/transaction-status/src/parse_stake.rs#L13
 */
const parsedInstructionsStake = () => {
    if (!memoisedParsedInstructionsStake)
        memoisedParsedInstructionsStake = [
            parsedTransactionInstructionType('StakeInitializeInstruction', {
                authorized: object('StakeInitializeInstructionAuthorized', {
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
                lockup: object('StakeInitializeInstructionLockup', {
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
                rentSysvar: string(),
                // Nested Account interface
                stakeAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.stakeAccount }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('StakeAuthorizeInstruction', {
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
                authorityType: string(),
                clockSysvar: string(),
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
                // Nested Account interface
                newAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.newAuthority }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                stakeAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.stakeAccount }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('StakeDelegateStakeInstruction', {
                clockSysvar: string(),
                // Nested Account interface
                stakeAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.stakeAccount }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                stakeAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.stakeAuthority }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                stakeConfigAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.stakeConfigAccount }, info),
                    type: accountInterface(),
                },
                stakeHistorySysvar: string(),
                // Nested Account interface
                voteAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.voteAccount }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('StakeSplitInstruction', {
                lamports: bigint(),
                newSplitAccount: string(),
                // Nested Account interface
                stakeAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.stakeAccount }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                stakeAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.stakeAuthority }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('StakeWithdrawInstruction', {
                clockSysvar: string(),
                destination: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.destination }, info),
                    type: accountInterface(),
                },
                lamports: bigint(),
                // Nested Account interface
                stakeAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.stakeAccount }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                withdrawAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.withdrawAuthority }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('StakeDeactivateInstruction', {
                clockSysvar: string(),
                // Nested Account interface
                stakeAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.stakeAccount }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                stakeAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.stakeAuthority }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('StakeSetLockupInstruction', {
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
                lockup: type(lockup()),
                // Nested Account interface
                stakeAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.stakeAccount }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('StakeMergeInstruction', {
                clockSysvar: string(),
                destination: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.destination }, info),
                    type: accountInterface(),
                },
                source: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.source }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                stakeAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.stakeAuthority }, info),
                    type: accountInterface(),
                },
                stakeHistorySysvar: string(),
            }),
            parsedTransactionInstructionType('StakeAuthorizeWithSeedInstruction', {
                // Nested Account interface
                authorityBase: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.authorityBase }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                authorityOwner: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.authorityOwner }, info),
                    type: accountInterface(),
                },
                authoritySeed: string(),
                authorityType: string(),
                clockSysvar: string(),
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
                // Nested Account interface
                newAuthorized: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.newAuthorized }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                stakeAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.stakeAccount }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('StakeInitializeCheckedInstruction', {
                rentSysvar: string(),
                // Nested Account interface
                stakeAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.stakeAccount }, info),
                    type: accountInterface(),
                },
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
            parsedTransactionInstructionType('StakeAuthorizeCheckedInstruction', {
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
                authorityType: string(),
                clockSysvar: string(),
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
                // Nested Account interface
                newAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.newAuthority }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                stakeAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.stakeAccount }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('StakeAuthorizeCheckedWithSeedInstruction', {
                // Nested Account interface
                authorityBase: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.authorityBase }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                authorityOwner: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.authorityOwner }, info),
                    type: accountInterface(),
                },
                authoritySeed: string(),
                authorityType: string(),
                clockSysvar: string(),
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
                // Nested Account interface
                newAuthorized: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.newAuthorized }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                stakeAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.stakeAccount }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('StakeSetLockupCheckedInstruction', {
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
                lockup: type(lockup()),
                // Nested Account interface
                stakeAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.stakeAccount }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('StakeDeactivateDelinquentInstruction', {
                referenceVoteAccount: string(),
                // Nested Account interface
                stakeAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.stakeAccount }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                voteAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.voteAccount }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('StakeRedelegateInstruction', {
                newStakeAccount: string(),
                // Nested Account interface
                stakeAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.stakeAccount }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                stakeAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.stakeAuthority }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                stakeConfigAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.stakeConfigAccount }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                voteAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.voteAccount }, info),
                    type: accountInterface(),
                },
            }),
        ];
    return memoisedParsedInstructionsStake;
};

let memoisedParsedInstructionsSystem: GraphQLObjectType[] | undefined;
/**
 * System program
 * @see https://github.com/solana-labs/solana/blob/d74de6780e2975472796a6a752b362152cd008a6/transaction-status/src/parse_system.rs#L13
 */
const parsedInstructionsSystem = () => {
    if (!memoisedParsedInstructionsSystem)
        memoisedParsedInstructionsSystem = [
            parsedTransactionInstructionType('CreateAccountInstruction', {
                lamports: bigint(),
                // Nested Account interface
                newAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.newAccount }, info),
                    type: accountInterface(),
                },
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
                source: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.source }, info),
                    type: accountInterface(),
                },
                space: bigint(),
            }),
            parsedTransactionInstructionType('AssignInstruction', {
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
            }),
            parsedTransactionInstructionType('TransferInstruction', {
                amount: string(),
                lamports: number(),
                source: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.source }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('CreateAccountWithSeedInstruction', {
                base: string(),
                lamports: bigint(),
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
                seed: string(),
                space: bigint(),
            }),
            parsedTransactionInstructionType('AdvanceNonceAccountInstruction', {
                // Nested Account interface
                nonceAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.nonceAccount }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                nonceAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.nonceAuthority }, info),
                    type: accountInterface(),
                },
                recentBlockhashesSysvar: string(),
            }),
            parsedTransactionInstructionType('WithdrawNonceAccountInstruction', {
                destination: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.destination }, info),
                    type: accountInterface(),
                },
                lamports: bigint(),
                // Nested Account interface
                nonceAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.nonceAccount }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                nonceAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.nonceAuthority }, info),
                    type: accountInterface(),
                },
                recentBlockhashesSysvar: string(),
                rentSysvar: string(),
            }),
            parsedTransactionInstructionType('InitializeNonceAccountInstruction', {
                // Nested Account interface
                nonceAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.nonceAccount }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                nonceAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.nonceAuthority }, info),
                    type: accountInterface(),
                },
                recentBlockhashesSysvar: string(),
                rentSysvar: string(),
            }),
            parsedTransactionInstructionType('AuthorizeNonceAccountInstruction', {
                // Nested Account interface
                newAuthorized: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.newAuthorized }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                nonceAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.nonceAccount }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                nonceAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.nonceAuthority }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('UpgradeNonceAccountInstruction', {
                // Nested Account interface
                nonceAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.nonceAccount }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('AllocateInstruction', {
                // Nested Account interface
                account: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.account }, info),
                    type: accountInterface(),
                },
                space: bigint(),
            }),
            parsedTransactionInstructionType('AllocateWithSeedInstruction', {
                // Nested Account interface
                account: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.account }, info),
                    type: accountInterface(),
                },
                base: string(),
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
                seed: string(),
                space: bigint(),
            }),
            parsedTransactionInstructionType('AssignWithSeedInstruction', {
                // Nested Account interface
                account: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.account }, info),
                    type: accountInterface(),
                },
                base: string(),
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
                seed: string(),
            }),
            parsedTransactionInstructionType('TransferWithSeedInstruction', {
                destination: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.destination }, info),
                    type: accountInterface(),
                },
                lamports: bigint(),
                source: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.source }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                sourceBase: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.sourceBase }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                sourceOwner: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.sourceOwner }, info),
                    type: accountInterface(),
                },
                sourceSeed: string(),
            }),
        ];
    return memoisedParsedInstructionsSystem;
};

let memoisedVote: GraphQLObjectType | undefined;
const vote = () => {
    if (!memoisedVote)
        memoisedVote = new GraphQLObjectType({
            fields: {
                hash: string(),
                slots: list(bigint()),
                timestamp: bigint(),
            },
            name: 'Vote',
        });
    return memoisedVote;
};

let memoisedVoteStateUpdate: GraphQLObjectType | undefined;
const voteStateUpdate = () => {
    if (!memoisedVoteStateUpdate)
        memoisedVoteStateUpdate = new GraphQLObjectType({
            fields: {
                hash: string(),
                lockouts: list(
                    object('VoteStateUpdateLockout', {
                        confirmationCount: number(),
                        slot: bigint(),
                    })
                ),
                root: bigint(),
                timestamp: bigint(),
            },
            name: 'VoteStateUpdate',
        });
    return memoisedVoteStateUpdate;
};

let memoisedParsedInstructionsVote: GraphQLObjectType[] | undefined;
/**
 * Vote program
 * @see https://github.com/solana-labs/solana/blob/d74de6780e2975472796a6a752b362152cd008a6/transaction-status/src/parse_vote.rs#L12
 */
const parsedInstructionsVote = () => {
    if (!memoisedParsedInstructionsVote)
        memoisedParsedInstructionsVote = [
            parsedTransactionInstructionType('VoteInitializeAccountInstruction', {
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
                clockSysvar: string(),
                commission: number(),
                node: string(),
                rentSysvar: string(),
                // Nested Account interface
                voteAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.voteAccount }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('VoteAuthorizeInstruction', {
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
                authorityType: string(),
                clockSysvar: string(),
                // Nested Account interface
                newAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.newAuthority }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                voteAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.voteAccount }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('VoteAuthorizeWithSeedInstruction', {
                // Nested Account interface
                authorityBaseKey: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.authorityBaseKey }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                authorityOwner: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.authorityOwner }, info),
                    type: accountInterface(),
                },
                authoritySeed: string(),
                authorityType: string(),
                clockSysvar: string(),
                // Nested Account interface
                newAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.newAuthority }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                voteAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.voteAccount }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('VoteAuthorizeCheckedWithSeedInstruction', {
                // Nested Account interface
                authorityBaseKey: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.authorityBaseKey }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                authorityOwner: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.authorityOwner }, info),
                    type: accountInterface(),
                },
                authoritySeed: string(),
                authorityType: string(),
                clockSysvar: string(),
                // Nested Account interface
                newAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.newAuthority }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                voteAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.voteAccount }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('VoteVoteInstruction', {
                clockSysvar: string(),
                slotHashedSysvar: string(),
                vote: type(vote()),
                // Nested Account interface
                voteAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.voteAccount }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                voteAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.voteAuthority }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('VoteUpdateVoteStateInstruction', {
                hash: string(),
                // Nested Account interface
                voteAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.voteAccount }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                voteAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.voteAuthority }, info),
                    type: accountInterface(),
                },
                voteStateUpdate: type(voteStateUpdate()),
            }),
            parsedTransactionInstructionType('VoteUpdateVoteStateSwitchInstruction', {
                hash: string(),
                // Nested Account interface
                voteAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.voteAccount }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                voteAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.voteAuthority }, info),
                    type: accountInterface(),
                },
                voteStateUpdate: type(voteStateUpdate()),
            }),
            parsedTransactionInstructionType('VoteCompactUpdateVoteStateInstruction', {
                hash: string(),
                // Nested Account interface
                voteAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.voteAccount }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                voteAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.voteAuthority }, info),
                    type: accountInterface(),
                },
                voteStateUpdate: type(voteStateUpdate()),
            }),
            parsedTransactionInstructionType('VoteCompactUpdateVoteStateSwitchInstruction', {
                hash: string(),
                // Nested Account interface
                voteAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.voteAccount }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                voteAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.voteAuthority }, info),
                    type: accountInterface(),
                },
                voteStateUpdate: type(voteStateUpdate()),
            }),
            parsedTransactionInstructionType('VoteWithdrawInstruction', {
                destination: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.destination }, info),
                    type: accountInterface(),
                },
                lamports: bigint(),
                // Nested Account interface
                voteAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.voteAccount }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                withdrawAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.withdrawAuthority }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('VoteUpdateValidatorIdentityInstruction', {
                // Nested Account interface
                newValidatorIdentity: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.newValidatorIdentity }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                voteAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.voteAccount }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                withdrawAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.withdrawAuthority }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('VoteUpdateCommissionInstruction', {
                commission: string(),
                // Nested Account interface
                voteAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.voteAccount }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                withdrawAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.withdrawAuthority }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('VoteVoteSwitchInstruction', {
                clockSysvar: string(),
                hash: string(),
                slotHashesSysvar: string(),
                vote: type(vote()),
                // Nested Account interface
                voteAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.voteAccount }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                voteAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.voteAuthority }, info),
                    type: accountInterface(),
                },
            }),
            parsedTransactionInstructionType('VoteAuthorizeCheckedInstruction', {
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
                authorityType: string(),
                clockSysvar: string(),
                // Nested Account interface
                newAuthority: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.newAuthority }, info),
                    type: accountInterface(),
                },
                // Nested Account interface
                voteAccount: {
                    args: {
                        commitment: type(commitmentInputType()),
                        dataSlice: type(dataSliceInputType()),
                        encoding: type(accountEncodingInputType()),
                        minContextSlot: bigint(),
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    resolve: (parent: any, args, context: any, info) =>
                        context.resolveAccount({ ...args, address: parent.voteAccount }, info),
                    type: accountInterface(),
                },
            }),
        ];
    return memoisedParsedInstructionsVote;
};

let memoisedTransactionMetaInterfaceFields: object | undefined;
/**
 * The fields for the transaction meta interface
 */
const transactionMetaInterfaceFields = () => {
    if (!memoisedTransactionMetaInterfaceFields)
        memoisedTransactionMetaInterfaceFields = {
            computeUnitsConsumed: bigint(),
            err: string(),
            fee: bigint(),
            format: string(),
            loadedAddresses: type(transactionMetaLoadedAddresses()),
            logMessages: list(string()),
            postBalances: list(bigint()),
            postTokenBalances: list(type(tokenBalance())),
            preBalances: list(bigint()),
            preTokenBalances: list(type(tokenBalance())),
            returnData: type(returnData()),
            rewards: list(type(reward())),
            status: type(transactionStatus()),
        };
    return memoisedTransactionMetaInterfaceFields;
};

let memoisedTransactionMetaInterface: GraphQLInterfaceType | undefined;
/**
 * Interface for a transaction meta
 */
const transactionMetaInterface = () => {
    if (!memoisedTransactionMetaInterface)
        memoisedTransactionMetaInterface = new GraphQLInterfaceType({
            fields: {
                ...transactionMetaInterfaceFields(),
            },
            name: 'TransactionMeta',
            resolveType(meta) {
                if (meta.format === 'parsed') {
                    return 'TransactionMetaParsed';
                }
                return 'TransactionMetaUnparsed';
            },
        });
    return memoisedTransactionMetaInterface;
};

/**
 * Builds a transaction meta type
 * @param name              The name of the transaction meta type
 * @param description       The description of the transaction meta type
 * @param innerInstructions The inner instructions of the transaction meta type
 * @returns                 The transaction meta type as a GraphQL object
 */
const transactionMetaType = (
    name: string,
    description: string,
    innerInstructions: { type: GraphQLList<GraphQLObjectType | GraphQLScalarType> }
) =>
    new GraphQLObjectType({
        description,
        fields: {
            ...transactionMetaInterfaceFields(),
            innerInstructions,
        },
        interfaces: [transactionMetaInterface()],
        name,
    });

let memoisedTransactionMetaUnparsed: GraphQLObjectType | undefined;
const transactionMetaUnparsed = () => {
    if (!memoisedTransactionMetaUnparsed)
        memoisedTransactionMetaUnparsed = transactionMetaType(
            'TransactionMetaUnparsed',
            'Non-parsed transaction meta',
            list(
                object('TransactionMetaInnerInstructionsUnparsed', {
                    index: number(),
                    instructions: list(
                        object('TransactionMetaInnerInstructionsUnparsedInstruction', {
                            index: number(),
                            instructions: list(type(transactionInstruction())),
                        })
                    ),
                })
            )
        );
    return memoisedTransactionMetaUnparsed;
};

let memoisedTransactionMetaParsed: GraphQLObjectType | undefined;
const transactionMetaParsed = () => {
    if (!memoisedTransactionMetaParsed)
        memoisedTransactionMetaParsed = transactionMetaType(
            'TransactionMetaParsed',
            'Parsed transaction meta',
            list(
                object('TransactionMetaInnerInstructionsParsed', {
                    index: number(),
                    instructions: list(type(parsedTransactionInstructionInterface())),
                })
            )
        );
    return memoisedTransactionMetaParsed;
};

let memoisedTransactionMessageInterfaceFields: object | undefined;
/**
 * The fields for the transaction message interface
 */
const transactionMessageInterfaceFields = () => {
    if (!memoisedTransactionMessageInterfaceFields)
        memoisedTransactionMessageInterfaceFields = {
            addressTableLookups: list(type(addressTableLookup())),
            format: string(),
            header: object('TransactionJsonTransactionHeader', {
                numReadonlySignedAccounts: number(),
                numReadonlyUnsignedAccounts: number(),
                numRequiredSignatures: number(),
            }),
            recentBlockhash: string(),
        };
    return memoisedTransactionMessageInterfaceFields;
};

let memoisedTransactionMessageInterface: GraphQLInterfaceType | undefined;
/**
 * Interface for a transaction message
 */
const transactionMessageInterface = () => {
    if (!memoisedTransactionMessageInterface)
        memoisedTransactionMessageInterface = new GraphQLInterfaceType({
            fields: {
                ...transactionMessageInterfaceFields(),
            },
            name: 'TransactionMessage',
            resolveType(message) {
                if (message.format === 'parsed') {
                    return 'TransactionMessageParsed';
                }
                return 'TransactionMessageUnparsed';
            },
        });
    return memoisedTransactionMessageInterface;
};

/**
 * Builds a transaction message type
 * @param name          The name of the transaction message type
 * @param description   The description of the transaction message type
 * @param accountKeys   The account keys of the transaction message type
 * @param instructions  The instructions of the transaction message type
 * @returns             The transaction message type as a GraphQL object
 */
const transactionMessageType = (
    name: string,
    description: string,
    accountKeys: { type: GraphQLList<GraphQLObjectType | GraphQLScalarType> },
    instructions: { type: GraphQLList<GraphQLInterfaceType | GraphQLObjectType | GraphQLScalarType> }
) =>
    new GraphQLObjectType({
        description,
        fields: {
            ...transactionMessageInterfaceFields(),
            accountKeys,
            instructions,
        },
        interfaces: [transactionMessageInterface()],
        name,
    });

let memoisedTransactionMessageUnparsed: GraphQLObjectType | undefined;
const transactionMessageUnparsed = () => {
    if (!memoisedTransactionMessageUnparsed)
        memoisedTransactionMessageUnparsed = transactionMessageType(
            'TransactionMessageUnparsed',
            'Non-parsed transaction message',
            list(string()),
            list(type(transactionInstruction()))
        );
    return memoisedTransactionMessageUnparsed;
};

let memoisedTransactionMessageParsed: GraphQLObjectType | undefined;
const transactionMessageParsed = () => {
    if (!memoisedTransactionMessageParsed)
        memoisedTransactionMessageParsed = transactionMessageType(
            'TransactionMessageParsed',
            'Parsed transaction message',
            list(
                object('transactionMessageParsedAccountKey', {
                    pubkey: string(),
                    signer: boolean(),
                    source: string(),
                    writable: boolean(),
                })
            ),
            list(type(parsedTransactionInstructionInterface()))
        );
    return memoisedTransactionMessageParsed;
};

let memoisedTransactionTransaction: GraphQLObjectType | undefined;
/**
 * The standard transaction type, comprised of all the interfaces
 */
const transactionTransaction = () => {
    if (!memoisedTransactionTransaction)
        memoisedTransactionTransaction = new GraphQLObjectType({
            fields: {
                message: type(transactionMessageInterface()),
                signatures: list(string()),
            },
            name: 'TransactionTransaction',
        });
    return memoisedTransactionTransaction;
};

let memoisedTransactionInterfaceFields: object | undefined;
/**
 * The fields for the transaction interface
 */
const transactionInterfaceFields = () => {
    if (!memoisedTransactionInterfaceFields)
        memoisedTransactionInterfaceFields = {
            blockTime: bigint(),
            encoding: string(),
            meta: type(transactionMetaInterface()),
            slot: bigint(),
        };
    return memoisedTransactionInterfaceFields;
};

let memoisedTransactionInterface: GraphQLInterfaceType | undefined;
/**
 * Interface for a transaction
 */
export const transactionInterface = () => {
    if (!memoisedTransactionInterface)
        memoisedTransactionInterface = new GraphQLInterfaceType({
            fields: {
                ...transactionInterfaceFields(),
            },
            name: 'Transaction',
            resolveType(transaction) {
                if (transaction.encoding === 'base58') {
                    return 'TransactionBase58';
                }
                if (transaction.encoding === 'base64') {
                    return 'TransactionBase64';
                }
                if (transaction.encoding === 'json') {
                    return 'TransactionJson';
                }
                return 'TransactionJsonParsed';
            },
        });
    return memoisedTransactionInterface;
};

/**
 * Builds a transaction type
 * @param name          The name of the transaction type
 * @param description   The description of the transaction type
 * @param transaction   The transaction of the transaction type
 * @returns             The transaction type as a GraphQL object
 */
const transactionType = (
    name: string,
    description: string,
    transaction: { type: GraphQLScalarType | GraphQLObjectType }
) =>
    new GraphQLObjectType({
        description,
        fields: {
            ...transactionInterfaceFields(),
            transaction,
        },
        interfaces: [transactionInterface()],
        name,
    });

let memoisedTransactionBase58: GraphQLObjectType | undefined;
const transactionBase58 = () => {
    if (!memoisedTransactionBase58)
        memoisedTransactionBase58 = transactionType(
            'TransactionBase58',
            'A Solana transaction as base58 encoded data',
            string()
        );
    return memoisedTransactionBase58;
};

let memoisedTransactionBase64: GraphQLObjectType | undefined;
const transactionBase64 = () => {
    if (!memoisedTransactionBase64)
        memoisedTransactionBase64 = transactionType(
            'TransactionBase64',
            'A Solana transaction as base64 encoded data',
            string()
        );
    return memoisedTransactionBase64;
};

let memoisedTransactionJson: GraphQLObjectType | undefined;
const transactionJson = () => {
    if (!memoisedTransactionJson)
        memoisedTransactionJson = transactionType(
            'TransactionJson',
            'A Solana transaction as a JSON object',
            type(transactionTransaction())
        );
    return memoisedTransactionJson;
};

let memoisedTransactionJsonParsed: GraphQLObjectType | undefined;
const transactionJsonParsed = () => {
    if (!memoisedTransactionJsonParsed)
        memoisedTransactionJsonParsed = transactionType(
            'TransactionJsonParsed',
            'A Solana transaction as a parsed JSON object',
            type(transactionTransaction())
        );
    return memoisedTransactionJsonParsed;
};

let memoisedTransactionTypes: GraphQLObjectType[] | undefined;
export const transactionTypes = () => {
    if (!memoisedTransactionTypes)
        memoisedTransactionTypes = [
            partiallyDecodedTransactionInstruction(),
            ...parsedInstructionsAddressLookupTable(),
            ...parsedInstructionsBpfLoader(),
            ...parsedInstructionsBpfUpgradeableLoader(),
            ...parsedInstructionsStake(),
            ...parsedInstructionsSplAssociatedToken(),
            parsedInstructionSplMemo(),
            ...parsedInstructionsSplToken(),
            ...parsedInstructionsSystem(),
            ...parsedInstructionsVote(),
            transactionMetaUnparsed(),
            transactionMetaParsed(),
            transactionMessageUnparsed(),
            transactionMessageParsed(),
            transactionBase58(),
            transactionBase64(),
            transactionJson(),
            transactionJsonParsed(),
        ];
    return memoisedTransactionTypes;
};
