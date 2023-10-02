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
