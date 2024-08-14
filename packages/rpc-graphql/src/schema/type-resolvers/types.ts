import { Kind } from 'graphql';

import { resolveAccount } from '../../resolvers/account';

const stringScalarAlias = {
    __parseLiteral(ast: { kind: Kind; value: bigint | boolean | number | string }): string | null {
        if (ast.kind === Kind.STRING) {
            return ast.value.toString();
        }
        return null;
    },
    __parseValue(value: string): string {
        return value;
    },
    __serialize(value: string): string {
        return value;
    },
};

const bigIntScalarAlias = {
    __parseLiteral(ast: { kind: Kind; value: bigint | boolean | number | string }): bigint | null {
        if (ast.kind === Kind.STRING || ast.kind === Kind.INT || ast.kind === Kind.FLOAT) {
            return BigInt(ast.value);
        }
        return null;
    },
    __parseValue(value: string): bigint {
        return BigInt(value);
    },
    __serialize(value: string): bigint {
        return BigInt(value);
    },
};

export const typeTypeResolvers = {
    AccountEncoding: {
        BASE_58: 'base58',
        BASE_64: 'base64',
        BASE_64_ZSTD: 'base64+zstd',
    },
    Address: stringScalarAlias,
    Base58EncodedBytes: stringScalarAlias,
    Base64EncodedBytes: stringScalarAlias,
    Base64ZstdEncodedBytes: stringScalarAlias,
    BigInt: bigIntScalarAlias,
    Commitment: {
        CONFIRMED: 'confirmed',
        FINALIZED: 'finalized',
        PROCESSED: 'processed',
    },
    CommitmentWithoutProcessed: {
        CONFIRMED: 'confirmed',
        FINALIZED: 'finalized',
    },
    Epoch: bigIntScalarAlias,
    Hash: stringScalarAlias,
    Lamports: bigIntScalarAlias,
    ProgramAccountsMemcmpFilterAccountEncoding: {
        BASE_58: 'base58',
        BASE_64: 'base64',
    },
    Signature: stringScalarAlias,
    Slot: bigIntScalarAlias,
    SplTokenDefaultAccountState: {
        FROZEN: 'frozen',
        INITIALIZED: 'initialized',
        UNINITIALIZED: 'uninitialized',
    },
    SplTokenExtensionType: {
        CONFIDENTIAL_TRANSFER_ACCOUNT: 'confidentialTransferAccount',
        CONFIDENTIAL_TRANSFER_FEE_AMOUNT: 'confidentialTransferFeeAmount',
        CONFIDENTIAL_TRANSFER_FEE_CONFIG: 'confidentialTransferFeeConfig',
        CONFIDENTIAL_TRANSFER_MINT: 'confidentialTransferMint',
        CPI_GUARD: 'cpiGuard',
        DEFAULT_ACCOUNT_STATE: 'defaultAccountState',
        GROUP_MEMBER_POINTER: 'groupMemberPointer',
        GROUP_POINTER: 'groupPointer',
        IMMUTABLE_OWNER: 'immutableOwner',
        INTEREST_BEARING_CONFIG: 'interestBearingConfig',
        MEMO_TRANSFER: 'memoTransfer',
        METADATA_POINTER: 'metadataPointer',
        MINT_CLOSE_AUTHORITY: 'mintCloseAuthority',
        NON_TRANSFERABLE: 'nonTransferable',
        NON_TRANSFERABLE_ACCOUNT: 'nonTransferableAccount',
        PERMANENT_DELEGATE: 'permanentDelegate',
        TOKEN_GROUP: 'tokenGroup',
        TOKEN_GROUP_MEMBER: 'tokenGroupMember',
        TOKEN_METADATA: 'tokenMetadata',
        TRANSFER_FEE_AMOUNT: 'transferFeeAmount',
        TRANSFER_FEE_CONFIG: 'transferFeeConfig',
        TRANSFER_HOOK: 'transferHook',
        TRANSFER_HOOK_ACCOUNT: 'transferHookAccount',
        UNINITIALIZED: 'uninitialized',
        UNPARSEABLE_EXTENSION: 'unparseableExtension',
    },
    TokenBalance: {
        mint: resolveAccount('mint'),
        owner: resolveAccount('owner'),
    },
    TransactionEncoding: {
        BASE_58: 'base58',
        BASE_64: 'base64',
    },
};
