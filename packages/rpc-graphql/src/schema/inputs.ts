import { GraphQLEnumType, GraphQLInputObjectType } from 'graphql';

import { number } from './picks';

export const accountEncodingInputType = new GraphQLEnumType({
    name: 'AccountEncoding',
    values: {
        base58: {
            value: 'base58',
        },
        base64: {
            value: 'base64',
        },
        base64Zstd: {
            value: 'base64+zstd',
        },
        jsonParsed: {
            value: 'jsonParsed',
        },
    },
});

export const blockTransactionDetailsInputType = new GraphQLEnumType({
    name: 'BlockTransactionDetails',
    values: {
        accounts: {
            value: 'accounts',
        },
        full: {
            value: 'full',
        },
        none: {
            value: 'none',
        },
        signatures: {
            value: 'signatures',
        },
    },
});

export const commitmentInputType = new GraphQLEnumType({
    name: 'Commitment',
    values: {
        confirmed: {
            value: 'confirmed',
        },
        finalized: {
            value: 'finalized',
        },
        processed: {
            value: 'processed',
        },
    },
});

export const dataSliceInputType = new GraphQLInputObjectType({
    fields: {
        length: number(),
        offset: number(),
    },
    name: 'DataSliceConfig',
});

export const maxSupportedTransactionVersionInputType = new GraphQLEnumType({
    name: 'MaxSupportedTransactionVersion',
    values: {
        legacy: {
            value: 'legacy',
        },
        zero: {
            value: '0',
        },
    },
});

export const transactionEncodingInputType = new GraphQLEnumType({
    name: 'TransactionEncoding',
    values: {
        base58: {
            value: 'base58',
        },
        base64: {
            value: 'base64',
        },
        json: {
            value: 'json',
        },
        jsonParsed: {
            value: 'jsonParsed',
        },
    },
});
