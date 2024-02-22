import { Kind } from 'graphql';

import { resolveAccount } from './account';

const stringScalarAlias = {
    __parseLiteral(ast: { kind: Kind; value: string | number | bigint | boolean }): string | null {
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
    __parseLiteral(ast: { kind: Kind; value: string | number | bigint | boolean }): bigint | null {
        if (ast.kind === Kind.STRING) {
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
    BlockTransactionDetails: {
        ACCOUNTS: 'accounts',
        FULL: 'full',
        NONE: 'none',
        SIGNATURES: 'signatures',
    },
    Commitment: {
        CONFIRMED: 'confirmed',
        FINALIZED: 'finalized',
        PROCESSED: 'processed',
    },
    Signature: stringScalarAlias,
    Slot: bigIntScalarAlias,
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
