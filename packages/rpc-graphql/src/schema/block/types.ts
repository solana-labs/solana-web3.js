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

const transactionForAccounts = new GraphQLObjectType({
    fields: {
        meta: object('TransactionMetaForAccounts', {
            computeUnitsUsed: bigint(),
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
        }),
        transaction: type(transactionInterface), // TODO
        version: string(),
    },
    name: 'TransactionForAccounts',
});

/**
 * The fields for the block interface
 */
const blockInterfaceFields = {
    blockHeight: bigint(),
    blockTime: bigint(),
    blockhash: string(),
    parentSlot: bigint(),
    previousBlockhash: string(),
    rewards: list(type(reward)),
};

/**
 * Interface for a block
 */
export const blockInterface = new GraphQLInterfaceType({
    fields: {
        ...blockInterfaceFields,
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

const BlockWithNoTransactions = new GraphQLObjectType({
    fields: {
        ...blockInterfaceFields,
    },
    interfaces: [blockInterface],
    name: 'BlockWithNoTransactions',
});

const blockWithSignatures = new GraphQLObjectType({
    fields: {
        ...blockInterfaceFields,
        signatures: list(string()),
    },
    interfaces: [blockInterface],
    name: 'BlockWithSignatures',
});

const blockWithAccounts = new GraphQLObjectType({
    fields: {
        ...blockInterfaceFields,
        transactions: list(type(transactionForAccounts)),
    },
    interfaces: [blockInterface],
    name: 'BlockWithAccounts',
});

const blockWithTransactions = new GraphQLObjectType({
    fields: {
        ...blockInterfaceFields,
        transactions: list(type(transactionInterface)),
    },
    interfaces: [blockInterface],
    name: 'BlockWithTransactions',
});

export const blockTypes = [BlockWithNoTransactions, blockWithSignatures, blockWithAccounts, blockWithTransactions];
