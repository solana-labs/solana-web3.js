import { GraphQLInterfaceType, GraphQLObjectType } from 'graphql';

import { bigint, list, object, string, type } from '../picks';
import {
    returnData,
    reward,
    tokenBalance,
    transactionInterface,
    transactionMetaLoadedAddresses,
    transactionStatus,
} from '../transaction';

let memoisedTransactionForAccounts: GraphQLObjectType | undefined;
const transactionForAccounts = () => {
    if (!memoisedTransactionForAccounts)
        memoisedTransactionForAccounts = new GraphQLObjectType({
            fields: {
                meta: object('TransactionMetaForAccounts', {
                    computeUnitsUsed: bigint(),
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
                }),
                transaction: type(transactionInterface()), // TODO
                version: string(),
            },
            name: 'TransactionForAccounts',
        });
    return memoisedTransactionForAccounts;
};

let memoisedBlockInterfaceFields: object | undefined;
/**
 * The fields for the block interface
 */
const blockInterfaceFields = () => {
    if (!memoisedBlockInterfaceFields)
        memoisedBlockInterfaceFields = {
            blockHeight: bigint(),
            blockTime: bigint(),
            blockhash: string(),
            parentSlot: bigint(),
            previousBlockhash: string(),
            rewards: list(type(reward())),
        };
    return memoisedBlockInterfaceFields;
};

let memoisedBlockInterface: GraphQLInterfaceType | undefined;
/**
 * Interface for a block
 */
export const blockInterface = () => {
    if (!memoisedBlockInterface)
        memoisedBlockInterface = new GraphQLInterfaceType({
            fields: {
                ...blockInterfaceFields(),
            },
            name: 'Block',
            resolveType(block) {
                if (block.transactionDetails === 'signatures') {
                    return 'BlockWithSignatures';
                }
                if (block.transactionDetails === 'accounts') {
                    return 'BlockWithAccounts';
                }
                if (block.transactionDetails === 'none') {
                    return 'BlockWithNoTransactions';
                }
                return 'BlockWithTransactions';
            },
        });
    return memoisedBlockInterface;
};

let memoisedBlockWithNoTransactions: GraphQLObjectType | undefined;
const blockWithNoTransactions = () => {
    if (!memoisedBlockWithNoTransactions)
        memoisedBlockWithNoTransactions = new GraphQLObjectType({
            fields: {
                ...blockInterfaceFields(),
            },
            interfaces: [blockInterface()],
            name: 'BlockWithNoTransactions',
        });
    return memoisedBlockWithNoTransactions;
};

let memoisedBlockWithSignatures: GraphQLObjectType | undefined;
const blockWithSignatures = () => {
    if (!memoisedBlockWithSignatures)
        memoisedBlockWithSignatures = new GraphQLObjectType({
            fields: {
                ...blockInterfaceFields(),
                signatures: list(string()),
            },
            interfaces: [blockInterface()],
            name: 'BlockWithSignatures',
        });
    return memoisedBlockWithSignatures;
};

let memoisedBlockWithAccounts: GraphQLObjectType | undefined;
const blockWithAccounts = () => {
    if (!memoisedBlockWithAccounts)
        memoisedBlockWithAccounts = new GraphQLObjectType({
            fields: {
                ...blockInterfaceFields(),
                transactions: list(type(transactionForAccounts())),
            },
            interfaces: [blockInterface()],
            name: 'BlockWithAccounts',
        });
    return memoisedBlockWithAccounts;
};

let memoisedBlockWithTransactions: GraphQLObjectType | undefined;
const blockWithTransactions = () => {
    if (!memoisedBlockWithTransactions)
        memoisedBlockWithTransactions = new GraphQLObjectType({
            fields: {
                ...blockInterfaceFields(),
                transactions: list(type(transactionInterface())),
            },
            interfaces: [blockInterface()],
            name: 'BlockWithTransactions',
        });
    return memoisedBlockWithTransactions;
};

let memoisedBlockTypes: GraphQLObjectType[] | undefined;
export const blockTypes = () => {
    if (!memoisedBlockTypes)
        memoisedBlockTypes = [
            blockWithNoTransactions(),
            blockWithSignatures(),
            blockWithAccounts(),
            blockWithTransactions(),
        ];
    return memoisedBlockTypes;
};
