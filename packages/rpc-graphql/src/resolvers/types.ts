import { resolveAccount } from './account';

export const commonTypeResolvers = {
    AccountEncoding: {
        BASE_58: 'base58',
        BASE_64: 'base64',
        BASE_64_ZSTD: 'base64+zstd',
        PARSED: 'jsonParsed',
    },
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
