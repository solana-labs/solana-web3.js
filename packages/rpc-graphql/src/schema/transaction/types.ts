import { GraphQLInterfaceType, GraphQLList, GraphQLObjectType, GraphQLScalarType, GraphQLUnionType } from 'graphql';

import { bigint, boolean, list, number, object, string, type } from '../picks';

export const tokenBalance = new GraphQLObjectType({
    fields: {
        accountIndex: number(),
        mint: string(),
        owner: string(),
        programId: string(),
        uiAmountString: string(),
    },
    name: 'TokenBalance',
});

export const transactionStatus = new GraphQLUnionType({
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

export const reward = new GraphQLObjectType({
    fields: {
        commission: number(),
        lamports: bigint(),
        postBalance: bigint(),
        pubkey: string(),
        rewardType: string(),
    },
    name: 'Reward',
});

const addressTableLookup = new GraphQLObjectType({
    fields: {
        accountKey: string(),
        readableIndexes: list(number()),
        writableIndexes: list(number()),
    },
    name: 'AddressTableLookup',
});

export const returnData = new GraphQLObjectType({
    fields: {
        data: string(),
        programId: string(),
    },
    name: 'ReturnData',
});

const transactionInstruction = new GraphQLObjectType({
    fields: {
        accounts: list(number()),
        data: string(),
        programIdIndex: number(),
    },
    name: 'TransactionInstruction',
});

export const transactionMetaLoadedAddresses = new GraphQLObjectType({
    fields: {
        readonly: list(string()), // Base58 encoded addresses
        writable: list(string()), // Base58 encoded addresses
    },
    name: 'TransactionMetaLoadedAddresses',
});

/**
 * Interface for a parsed transaction instruction
 */
const parsedTransactionInstructionInterface = new GraphQLInterfaceType({
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
        interfaces: [parsedTransactionInstructionInterface],
        name,
    });

const partiallyDecodedTransactionInstruction = new GraphQLObjectType({
    fields: {
        accounts: list(string()),
        data: string(),
        programId: string(),
    },
    interfaces: [parsedTransactionInstructionInterface],
    name: 'PartiallyDecodedInstruction',
});

/**
 * Address Lookup Table program
 * @see https://github.com/solana-labs/solana/blob/7afb11f1e6daa3e9bd93cfe203211de5b14ba56a/transaction-status/src/parse_address_lookup_table.rs#L13
 */
const parsedInstructionsAddressLookupTable = [
    parsedTransactionInstructionType('CreateLookupTableInstruction', {
        bumpSeed: number(),
        lookupTableAccount: string(),
        lookupTableAuthority: string(),
        payerAccount: string(),
        recentSlot: bigint(),
        systemProgram: string(),
    }),
    parsedTransactionInstructionType('FreezeLookupTableInstruction', {
        lookupTableAccount: string(),
        lookupTableAuthority: string(),
    }),
    parsedTransactionInstructionType('ExtendLookupTableInstruction', {
        lookupTableAccount: string(),
        lookupTableAuthority: string(),
        newAddresses: list(string()),
        payerAccount: string(),
        systemProgram: string(),
    }),
    parsedTransactionInstructionType('DeactivateLookupTableInstruction', {
        lookupTableAccount: string(),
        lookupTableAuthority: string(),
    }),
    parsedTransactionInstructionType('CloseLookupTableInstruction', {
        lookupTableAccount: string(),
        lookupTableAuthority: string(),
        recipient: string(),
    }),
];

/**
 * BPF Loader program
 * @see https://github.com/solana-labs/solana/blob/7afb11f1e6daa3e9bd93cfe203211de5b14ba56a/transaction-status/src/parse_bpf_loader.rs#L14
 */
const parsedInstructionsBpfLoader = [
    parsedTransactionInstructionType('BpfLoaderWriteInstruction', {
        account: string(),
        bytes: string(),
        offset: number(),
    }),
    parsedTransactionInstructionType('BpfLoaderFinalizeInstruction', {
        account: string(),
    }),
];

/**
 * BPF Upgradeable Loader program
 * @see https://github.com/solana-labs/solana/blob/7afb11f1e6daa3e9bd93cfe203211de5b14ba56a/transaction-status/src/parse_bpf_loader.rs#L49
 */
const parsedInstructionsBpfUpgradeableLoader = [
    parsedTransactionInstructionType('BpfUpgradeableLoaderInitializeBufferInstruction', {
        account: string(),
    }),
    parsedTransactionInstructionType('BpfUpgradeableLoaderWriteInstruction', {
        account: string(),
        authority: string(),
        bytes: string(),
        offset: number(),
    }),
    parsedTransactionInstructionType('BpfUpgradeableLoaderDeployWithMaxDataLenInstruction', {
        authority: string(),
        bufferAccount: string(),
        clockSysvar: string(),
        maxDataLen: bigint(),
        payerAccount: string(),
        programAccount: string(),
        programDataAccount: string(),
        rentSysvar: string(),
    }),
    parsedTransactionInstructionType('BpfUpgradeableLoaderUpgradeInstruction', {
        authority: string(),
        bufferAccount: string(),
        clockSysvar: string(),
        programAccount: string(),
        programDataAccount: string(),
        rentSysvar: string(),
        spillAccount: string(),
    }),
    parsedTransactionInstructionType('BpfUpgradeableLoaderSetAuthorityInstruction', {
        account: string(),
        authority: string(),
        newAuthority: string(),
    }),
    parsedTransactionInstructionType('BpfUpgradeableLoaderSetAuthorityCheckedInstruction', {
        account: string(),
        authority: string(),
        newAuthority: string(),
    }),
    parsedTransactionInstructionType('BpfUpgradeableLoaderCloseInstruction', {
        account: string(),
        authority: string(),
        programAccount: string(),
        recipient: string(),
    }),
    parsedTransactionInstructionType('BpfUpgradeableLoaderExtendProgramInstruction', {
        additionalBytes: bigint(),
        payerAccount: string(),
        programAccount: string(),
        programDataAccount: string(),
        systemProgram: string(),
    }),
];

/**
 * SPL Associated Token Account program
 * @see https://github.com/solana-labs/solana/blob/1a2c0943db6519dc9519bfc74c2426332ba26850/transaction-status/src/parse_associated_token.rs#L17
 */
const parsedInstructionsSplAssociatedToken = [
    parsedTransactionInstructionType('SplAssociatedTokenCreateInstruction', {
        account: string(),
        mint: string(),
        source: string(),
        systemProgram: string(),
        tokenProgram: string(),
        wallet: string(),
    }),
    parsedTransactionInstructionType('SplAssociatedTokenCreateIdempotentInstruction', {
        account: string(),
        mint: string(),
        source: string(),
        systemProgram: string(),
        tokenProgram: string(),
        wallet: string(),
    }),
    parsedTransactionInstructionType('SplAssociatedTokenRecoverNestedInstruction', {
        destination: string(),
        nestedMint: string(),
        nestedOwner: string(),
        nestedSource: string(),
        ownerMint: string(),
        tokenProgram: string(),
        wallet: string(),
    }),
];

/**
 * SPL Memo program
 * @see https://github.com/solana-labs/solana/blob/1a2c0943db6519dc9519bfc74c2426332ba26850/transaction-status/src/parse_instruction.rs#L146
 */
const parsedInstructionSplMemo = new GraphQLObjectType({
    fields: {
        parsed: string(),
        program: string(),
        programId: string(),
    },
    interfaces: [parsedTransactionInstructionInterface],
    name: 'SplMemoInstruction',
});

/**
 * SPL Token program
 * @see https://github.com/solana-labs/solana/blob/d74de6780e2975472796a6a752b362152cd008a6/transaction-status/src/parse_token.rs#L29
 */
const parsedInstructionsSplToken = [
    parsedTransactionInstructionType('SplTokenInitializeMintInstruction', {
        decimals: number(),
        freezeAuthority: string(),
        mint: string(),
        mintAuthority: string(),
        rentSysvar: string(),
    }),
    parsedTransactionInstructionType('SplTokenInitializeMint2Instruction', {
        decimals: number(),
        freezeAuthority: string(),
        mint: string(),
        mintAuthority: string(),
    }),
    parsedTransactionInstructionType('SplTokenInitializeAccountInstruction', {
        account: string(),
        mint: string(),
        owner: string(),
        rentSysvar: string(),
    }),
    parsedTransactionInstructionType('SplTokenInitializeAccount2Instruction', {
        account: string(),
        mint: string(),
        owner: string(),
        rentSysvar: string(),
    }),
    parsedTransactionInstructionType('SplTokenInitializeAccount3Instruction', {
        account: string(),
        mint: string(),
        owner: string(),
    }),
    parsedTransactionInstructionType('SplTokenInitializeMultisigInstruction', {
        m: number(),
        multisig: string(),
        rentSysvar: string(),
        signers: list(string()),
    }),
    parsedTransactionInstructionType('SplTokenInitializeMultisig2Instruction', {
        m: number(),
        multisig: string(),
        signers: list(string()),
    }),
    parsedTransactionInstructionType('SplTokenTransferInstruction', {
        amount: string(),
        authority: string(),
        destination: string(),
        multisigAuthority: string(),
        source: string(),
    }),
    parsedTransactionInstructionType('SplTokenApproveInstruction', {
        amount: string(),
        delegate: string(),
        multisigOwner: string(),
        owner: string(),
        source: string(),
    }),
    parsedTransactionInstructionType('SplTokenRevokeInstruction', {
        multisigOwner: string(),
        owner: string(),
        source: string(),
    }),
    parsedTransactionInstructionType('SplTokenSetAuthorityInstruction', {
        authority: string(),
        authorityType: string(),
        multisigAuthority: string(),
        newAuthority: string(),
    }),
    parsedTransactionInstructionType('SplTokenMintToInstruction', {
        account: string(),
        amount: string(),
        authority: string(),
        mint: string(),
        mintAuthority: string(),
        multisigMintAuthority: string(),
    }),
    parsedTransactionInstructionType('SplTokenBurnInstruction', {
        account: string(),
        amount: string(),
        authority: string(),
        mint: string(),
        multisigAuthority: string(),
    }),
    parsedTransactionInstructionType('SplTokenCloseAccountInstruction', {
        account: string(),
        destination: string(),
        multisigOwner: string(),
        owner: string(),
    }),
    parsedTransactionInstructionType('SplTokenFreezeAccountInstruction', {
        account: string(),
        freezeAuthority: string(),
        mint: string(),
        multisigFreezeAuthority: string(),
    }),
    parsedTransactionInstructionType('SplTokenThawAccountInstruction', {
        account: string(),
        freezeAuthority: string(),
        mint: string(),
        multisigFreezeAuthority: string(),
    }),
    parsedTransactionInstructionType('SplTokenTransferCheckedInstruction', {
        authority: string(),
        destination: string(),
        mint: string(),
        multisigAuthority: string(),
        source: string(),
        tokenAmount: string(),
    }),
    parsedTransactionInstructionType('SplTokenApproveCheckedInstruction', {
        delegate: string(),
        mint: string(),
        multisigOwner: string(),
        owner: string(),
        source: string(),
        tokenAmount: string(),
    }),
    parsedTransactionInstructionType('SplTokenMintToCheckedInstruction', {
        account: string(),
        authority: string(),
        mint: string(),
        mintAuthority: string(),
        multisigMintAuthority: string(),
        tokenAmount: string(),
    }),
    parsedTransactionInstructionType('SplTokenBurnCheckedInstruction', {
        account: string(),
        authority: string(),
        mint: string(),
        multisigAuthority: string(),
        tokenAmount: string(),
    }),
    parsedTransactionInstructionType('SplTokenSyncNativeInstruction', {
        account: string(),
    }),
    parsedTransactionInstructionType('SplTokenGetAccountDataSizeInstruction', {
        extensionTypes: list(string()),
        mint: string(),
    }),
    parsedTransactionInstructionType('SplTokenInitializeImmutableOwnerInstruction', {
        account: string(),
    }),
    parsedTransactionInstructionType('SplTokenAmountToUiAmountInstruction', {
        amount: string(),
        mint: string(),
    }),
    parsedTransactionInstructionType('SplTokenUiAmountToAmountInstruction', {
        mint: string(),
        uiAmount: string(),
    }),
    parsedTransactionInstructionType('SplTokenInitializeMintCloseAuthorityInstruction', {
        mint: string(),
        newAuthority: string(),
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

const lockup = new GraphQLObjectType({
    fields: {
        custodian: string(),
        epoch: bigint(),
        unixTimestamp: bigint(),
    },
    name: 'Lockup',
});

/**
 * Stake program
 * @see https://github.com/solana-labs/solana/blob/7afb11f1e6daa3e9bd93cfe203211de5b14ba56a/transaction-status/src/parse_stake.rs#L13
 */
const parsedInstructionsStake = [
    parsedTransactionInstructionType('StakeInitializeInstruction', {
        authorized: object('StakeInitializeInstructionAuthorized', {
            staker: string(),
            withdrawer: string(),
        }),
        lockup: object('StakeInitializeInstructionLockup', {
            custodian: string(),
            epoch: bigint(),
            unixTimestamp: bigint(),
        }),
        rentSysvar: string(),
        stakeAccount: string(),
    }),
    parsedTransactionInstructionType('StakeAuthorizeInstruction', {
        authority: string(),
        authorityType: string(),
        clockSysvar: string(),
        custodian: string(),
        newAuthority: string(),
        stakeAccount: string(),
    }),
    parsedTransactionInstructionType('StakeDelegateStakeInstruction', {
        clockSysvar: string(),
        stakeAccount: string(),
        stakeAuthority: string(),
        stakeConfigAccount: string(),
        stakeHistorySysvar: string(),
        voteAccount: string(),
    }),
    parsedTransactionInstructionType('StakeSplitInstruction', {
        lamports: bigint(),
        newSplitAccount: string(),
        stakeAccount: string(),
        stakeAuthority: string(),
    }),
    parsedTransactionInstructionType('StakeWithdrawInstruction', {
        clockSysvar: string(),
        destination: string(),
        lamports: bigint(),
        stakeAccount: string(),
        withdrawAuthority: string(),
    }),
    parsedTransactionInstructionType('StakeDeactivateInstruction', {
        clockSysvar: string(),
        stakeAccount: string(),
        stakeAuthority: string(),
    }),
    parsedTransactionInstructionType('StakeSetLockupInstruction', {
        custodian: string(),
        lockup: type(lockup),
        stakeAccount: string(),
    }),
    parsedTransactionInstructionType('StakeMergeInstruction', {
        clockSysvar: string(),
        destination: string(),
        source: string(),
        stakeAuthority: string(),
        stakeHistorySysvar: string(),
    }),
    parsedTransactionInstructionType('StakeAuthorizeWithSeedInstruction', {
        authorityBase: string(),
        authorityOwner: string(),
        authoritySeed: string(),
        authorityType: string(),
        clockSysvar: string(),
        custodian: string(),
        newAuthorized: string(),
        stakeAccount: string(),
    }),
    parsedTransactionInstructionType('StakeInitializeCheckedInstruction', {
        rentSysvar: string(),
        stakeAccount: string(),
        staker: string(),
        withdrawer: string(),
    }),
    parsedTransactionInstructionType('StakeAuthorizeCheckedInstruction', {
        authority: string(),
        authorityType: string(),
        clockSysvar: string(),
        custodian: string(),
        newAuthority: string(),
        stakeAccount: string(),
    }),
    parsedTransactionInstructionType('StakeAuthorizeCheckedWithSeedInstruction', {
        authorityBase: string(),
        authorityOwner: string(),
        authoritySeed: string(),
        authorityType: string(),
        clockSysvar: string(),
        custodian: string(),
        newAuthorized: string(),
        stakeAccount: string(),
    }),
    parsedTransactionInstructionType('StakeSetLockupCheckedInstruction', {
        custodian: string(),
        lockup: type(lockup),
        stakeAccount: string(),
    }),
    parsedTransactionInstructionType('StakeDeactivateDelinquentInstruction', {
        referenceVoteAccount: string(),
        stakeAccount: string(),
        voteAccount: string(),
    }),
    parsedTransactionInstructionType('StakeRedelegateInstruction', {
        newStakeAccount: string(),
        stakeAccount: string(),
        stakeAuthority: string(),
        stakeConfigAccount: string(),
        voteAccount: string(),
    }),
];

/**
 * System program
 * @see https://github.com/solana-labs/solana/blob/d74de6780e2975472796a6a752b362152cd008a6/transaction-status/src/parse_system.rs#L13
 */
const parsedInstructionsSystem = [
    parsedTransactionInstructionType('CreateAccountInstruction', {
        lamports: bigint(),
        newAccount: string(),
        owner: string(),
        source: string(),
        space: bigint(),
    }),
    parsedTransactionInstructionType('AssignInstruction', {
        owner: string(),
    }),
    parsedTransactionInstructionType('TransferInstruction', {
        amount: string(),
        lamports: number(),
        source: string(),
    }),
    parsedTransactionInstructionType('CreateAccountWithSeedInstruction', {
        base: string(),
        lamports: bigint(),
        owner: string(),
        seed: string(),
        space: bigint(),
    }),
    parsedTransactionInstructionType('AdvanceNonceAccountInstruction', {
        nonceAccount: string(),
        nonceAuthority: string(),
        recentBlockhashesSysvar: string(),
    }),
    parsedTransactionInstructionType('WithdrawNonceAccountInstruction', {
        destination: string(),
        lamports: bigint(),
        nonceAccount: string(),
        nonceAuthority: string(),
        recentBlockhashesSysvar: string(),
        rentSysvar: string(),
    }),
    parsedTransactionInstructionType('InitializeNonceAccountInstruction', {
        nonceAccount: string(),
        nonceAuthority: string(),
        recentBlockhashesSysvar: string(),
        rentSysvar: string(),
    }),
    parsedTransactionInstructionType('AuthorizeNonceAccountInstruction', {
        newAuthorized: string(),
        nonceAccount: string(),
        nonceAuthority: string(),
    }),
    parsedTransactionInstructionType('UpgradeNonceAccountInstruction', {
        nonceAccount: string(),
    }),
    parsedTransactionInstructionType('AllocateInstruction', {
        account: string(),
        space: bigint(),
    }),
    parsedTransactionInstructionType('AllocateWithSeedInstruction', {
        account: string(),
        base: string(),
        owner: string(),
        seed: string(),
        space: bigint(),
    }),
    parsedTransactionInstructionType('AssignWithSeedInstruction', {
        account: string(),
        base: string(),
        owner: string(),
        seed: string(),
    }),
    parsedTransactionInstructionType('TransferWithSeedInstruction', {
        destination: string(),
        lamports: bigint(),
        source: string(),
        sourceBase: string(),
        sourceOwner: string(),
        sourceSeed: string(),
    }),
];

const vote = new GraphQLObjectType({
    fields: {
        hash: string(),
        slots: list(bigint()),
        timestamp: bigint(),
    },
    name: 'Vote',
});

const voteStateUpdate = new GraphQLObjectType({
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

/**
 * Vote program
 * @see https://github.com/solana-labs/solana/blob/d74de6780e2975472796a6a752b362152cd008a6/transaction-status/src/parse_vote.rs#L12
 */
const parsedInstructionsVote = [
    parsedTransactionInstructionType('VoteInitializeAccountInstruction', {
        authorizedVoter: string(),
        authorizedWithdrawer: string(),
        clockSysvar: string(),
        commission: number(),
        node: string(),
        rentSysvar: string(),
        voteAccount: string(),
    }),
    parsedTransactionInstructionType('VoteAuthorizeInstruction', {
        authority: string(),
        authorityType: string(),
        clockSysvar: string(),
        newAuthority: string(),
        voteAccount: string(),
    }),
    parsedTransactionInstructionType('VoteAuthorizeWithSeedInstruction', {
        authorityBaseKey: string(),
        authorityOwner: string(),
        authoritySeed: string(),
        authorityType: string(),
        clockSysvar: string(),
        newAuthority: string(),
        voteAccount: string(),
    }),
    parsedTransactionInstructionType('VoteAuthorizeCheckedWithSeedInstruction', {
        authorityBaseKey: string(),
        authorityOwner: string(),
        authoritySeed: string(),
        authorityType: string(),
        clockSysvar: string(),
        newAuthority: string(),
        voteAccount: string(),
    }),
    parsedTransactionInstructionType('VoteVoteInstruction', {
        clockSysvar: string(),
        slotHashedSysvar: string(),
        vote: type(vote),
        voteAccount: string(),
        voteAuthority: string(),
    }),
    parsedTransactionInstructionType('VoteUpdateVoteStateInstruction', {
        hash: string(),
        voteAccount: string(),
        voteAuthority: string(),
        voteStateUpdate: type(voteStateUpdate),
    }),
    parsedTransactionInstructionType('VoteUpdateVoteStateSwitchInstruction', {
        hash: string(),
        voteAccount: string(),
        voteAuthority: string(),
        voteStateUpdate: type(voteStateUpdate),
    }),
    parsedTransactionInstructionType('VoteCompactUpdateVoteStateInstruction', {
        hash: string(),
        voteAccount: string(),
        voteAuthority: string(),
        voteStateUpdate: type(voteStateUpdate),
    }),
    parsedTransactionInstructionType('VoteCompactUpdateVoteStateSwitchInstruction', {
        hash: string(),
        voteAccount: string(),
        voteAuthority: string(),
        voteStateUpdate: type(voteStateUpdate),
    }),
    parsedTransactionInstructionType('VoteWithdrawInstruction', {
        destination: string(),
        lamports: bigint(),
        voteAccount: string(),
        withdrawAuthority: string(),
    }),
    parsedTransactionInstructionType('VoteUpdateValidatorIdentityInstruction', {
        newValidatorIdentity: string(),
        voteAccount: string(),
        withdrawAuthority: string(),
    }),
    parsedTransactionInstructionType('VoteUpdateCommissionInstruction', {
        commission: string(),
        voteAccount: string(),
        withdrawAuthority: string(),
    }),
    parsedTransactionInstructionType('VoteVoteSwitchInstruction', {
        clockSysvar: string(),
        hash: string(),
        slotHashesSysvar: string(),
        vote: type(vote),
        voteAccount: string(),
        voteAuthority: string(),
    }),
    parsedTransactionInstructionType('VoteAuthorizeCheckedInstruction', {
        authority: string(),
        authorityType: string(),
        clockSysvar: string(),
        newAuthority: string(),
        voteAccount: string(),
    }),
];

/**
 * The fields for the transaction meta interface
 */
const transactionMetaInterfaceFields = {
    computeUnitsConsumed: bigint(),
    err: string(),
    fee: bigint(),
    format: string(),
    loadedAddresses: type(transactionMetaLoadedAddresses),
    logMessages: list(string()),
    postBalances: list(bigint()),
    postTokenBalances: list(type(tokenBalance)),
    preBalances: list(bigint()),
    preTokenBalances: list(type(tokenBalance)),
    returnData: type(returnData),
    rewards: list(type(reward)),
    status: type(transactionStatus),
};

/**
 * Interface for a transaction meta
 */
const transactionMetaInterface = new GraphQLInterfaceType({
    fields: {
        ...transactionMetaInterfaceFields,
    },
    name: 'TransactionMeta',
    resolveType(meta) {
        if (meta.format === 'parsed') {
            return 'TransactionMetaParsed';
        }
        return 'TransactionMetaUnparsed';
    },
});

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
            ...transactionMetaInterfaceFields,
            innerInstructions,
        },
        interfaces: [transactionMetaInterface],
        name,
    });

const transactionMetaUnparsed = transactionMetaType(
    'TransactionMetaUnparsed',
    'Non-parsed transaction meta',
    list(
        object('TransactionMetaInnerInstructionsUnparsed', {
            index: number(),
            instructions: list(
                object('TransactionMetaInnerInstructionsUnparsedInstruction', {
                    index: number(),
                    instructions: list(type(transactionInstruction)),
                })
            ),
        })
    )
);

const transactionMetaParsed = transactionMetaType(
    'TransactionMetaParsed',
    'Parsed transaction meta',
    list(
        object('TransactionMetaInnerInstructionsParsed', {
            index: number(),
            instructions: list(type(parsedTransactionInstructionInterface)),
        })
    )
);

/**
 * The fields for the transaction message interface
 */
const transactionMessageInterfaceFields = {
    addressTableLookups: list(type(addressTableLookup)),
    format: string(),
    header: object('TransactionJsonTransactionHeader', {
        numReadonlySignedAccounts: number(),
        numReadonlyUnsignedAccounts: number(),
        numRequiredSignatures: number(),
    }),
    recentBlockhash: string(),
};

/**
 * Interface for a transaction message
 */
const transactionMessageInterface = new GraphQLInterfaceType({
    fields: {
        ...transactionMessageInterfaceFields,
    },
    name: 'TransactionMessage',
    resolveType(message) {
        if (message.format === 'parsed') {
            return 'TransactionMessageParsed';
        }
        return 'TransactionMessageUnparsed';
    },
});

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
            ...transactionMessageInterfaceFields,
            accountKeys,
            instructions,
        },
        interfaces: [transactionMessageInterface],
        name,
    });

const transactionMessageUnparsed = transactionMessageType(
    'TransactionMessageUnparsed',
    'Non-parsed transaction message',
    list(string()),
    list(type(transactionInstruction))
);

const transactionMessageParsed = transactionMessageType(
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
    list(type(parsedTransactionInstructionInterface))
);

/**
 * The standard transaction type, comprised of all the interfaces
 */
const transactionTransaction = new GraphQLObjectType({
    fields: {
        message: type(transactionMessageInterface),
        signatures: list(string()),
    },
    name: 'TransactionTransaction',
});

/**
 * The fields for the transaction interface
 */
const transactionInterfaceFields = {
    blockTime: bigint(),
    encoding: string(),
    meta: type(transactionMetaInterface),
    slot: bigint(),
};

/**
 * Interface for a transaction
 */
export const transactionInterface = new GraphQLInterfaceType({
    fields: {
        ...transactionInterfaceFields,
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
            ...transactionInterfaceFields,
            transaction,
        },
        interfaces: [transactionInterface],
        name,
    });

const transactionBase58 = transactionType('TransactionBase58', 'A Solana transaction as base58 encoded data', string());

const transactionBase64 = transactionType('TransactionBase64', 'A Solana transaction as base64 encoded data', string());

const transactionJson = transactionType(
    'TransactionJson',
    'A Solana transaction as a JSON object',
    type(transactionTransaction)
);

const transactionJsonParsed = transactionType(
    'TransactionJsonParsed',
    'A Solana transaction as a parsed JSON object',
    type(transactionTransaction)
);

export const transactionTypes = [
    partiallyDecodedTransactionInstruction,
    ...parsedInstructionsAddressLookupTable,
    ...parsedInstructionsBpfLoader,
    ...parsedInstructionsBpfUpgradeableLoader,
    ...parsedInstructionsStake,
    ...parsedInstructionsSplAssociatedToken,
    parsedInstructionSplMemo,
    ...parsedInstructionsSplToken,
    ...parsedInstructionsSystem,
    ...parsedInstructionsVote,
    transactionMetaUnparsed,
    transactionMetaParsed,
    transactionMessageUnparsed,
    transactionMessageParsed,
    transactionBase58,
    transactionBase64,
    transactionJson,
    transactionJsonParsed,
];
