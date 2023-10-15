import { GraphQLEnumType, GraphQLInputObjectType } from 'graphql';

import { bigint, number, string } from './picks';

let memoisedAccountEncodingInputType: GraphQLEnumType | undefined;
export const accountEncodingInputType = () => {
    if (!memoisedAccountEncodingInputType)
        memoisedAccountEncodingInputType = new GraphQLEnumType({
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
    return memoisedAccountEncodingInputType;
};

let memoisedBlockTransactionDetailsInputType: GraphQLEnumType | undefined;
export const blockTransactionDetailsInputType = () => {
    if (!memoisedBlockTransactionDetailsInputType)
        memoisedBlockTransactionDetailsInputType = new GraphQLEnumType({
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
    return memoisedBlockTransactionDetailsInputType;
};

let memoisedCommitmentInputType: GraphQLEnumType | undefined;
export const commitmentInputType = () => {
    if (!memoisedCommitmentInputType)
        memoisedCommitmentInputType = new GraphQLEnumType({
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
    return memoisedCommitmentInputType;
};

let memoisedDataSliceInputType: GraphQLInputObjectType | undefined;
export const dataSliceInputType = () => {
    if (!memoisedDataSliceInputType)
        memoisedDataSliceInputType = new GraphQLInputObjectType({
            fields: {
                length: number(),
                offset: number(),
            },
            name: 'DataSliceConfig',
        });
    return memoisedDataSliceInputType;
};

let memoisedMaxSupportedTransactionVersionInputType: GraphQLEnumType | undefined;
export const maxSupportedTransactionVersionInputType = () => {
    if (!memoisedMaxSupportedTransactionVersionInputType)
        memoisedMaxSupportedTransactionVersionInputType = new GraphQLEnumType({
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
    return memoisedMaxSupportedTransactionVersionInputType;
};

let memoisedProgramAccountFilterInputType: GraphQLInputObjectType | undefined;
export const programAccountFilterInputType = () => {
    if (!memoisedProgramAccountFilterInputType)
        memoisedProgramAccountFilterInputType = new GraphQLInputObjectType({
            fields: {
                bytes: bigint(),
                dataSize: bigint(),
                encoding: string(),
                offset: bigint(),
            },
            name: 'ProgramAccountFilter',
        });
    return memoisedProgramAccountFilterInputType;
};

let memoisedTransactionEncodingInputType: GraphQLEnumType | undefined;
export const transactionEncodingInputType = () => {
    if (!memoisedTransactionEncodingInputType)
        memoisedTransactionEncodingInputType = new GraphQLEnumType({
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
    return memoisedTransactionEncodingInputType;
};
