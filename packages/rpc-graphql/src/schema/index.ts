import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphQLResolveInfo } from 'graphql';

import { RpcGraphQLContext } from '../context';
import { AccountLoaderArgs } from '../loaders/account';
import { BlockLoaderArgs } from '../loaders/block';
import { ProgramAccountsLoaderArgs } from '../loaders/program-accounts';
import { TransactionLoaderArgs } from '../loaders/transaction';
import { accountResolvers, accountTypeDefs } from './account';
import { blockResolvers, blockTypeDefs } from './block';
import { inputResolvers, inputTypeDefs } from './common/inputs';
import { scalarResolvers, scalarTypeDefs } from './common/scalars';
import { commonResolvers, commonTypeDefs } from './common/types';
import { instructionResolvers, instructionTypeDefs } from './instruction';
import { transactionResolvers, transactionTypeDefs } from './transaction';

// prettier-ignore
const schemaTypeDefs = /* GraphQL */ `
    type Query {
        account(
            address: String!
            commitment: Commitment
            dataSlice: DataSlice
            encoding: AccountEncoding
            minContextSlot: BigInt
        ): Account
        block(
            slot: BigInt!
            commitment: Commitment
            encoding: TransactionEncoding
            transactionDetails: BlockTransactionDetails
        ): Block
        programAccounts(
            programAddress: String!
            commitment: Commitment
            dataSlice: DataSlice
            encoding: AccountEncoding
            filters: [ProgramAccountsFilter]
            minContextSlot: BigInt
        ): [Account]
        transaction(
            signature: String!
            commitment: Commitment
            encoding: TransactionEncoding
        ): Transaction
    }

    schema {
        query: Query
    }
`;

// prettier-ignore
const schemaResolvers = {
    Query: {
        account(
            _: unknown,
            args: AccountLoaderArgs,
            context: RpcGraphQLContext,
            info?: GraphQLResolveInfo
        ) {
            return context.loaders.account.load(args, info);
        },
        block(
            _: unknown,
            args: BlockLoaderArgs,
            context: RpcGraphQLContext,
            info?: GraphQLResolveInfo
        ) {
            return context.loaders.block.load(args, info);
        },
        programAccounts(
            _: unknown,
            args: ProgramAccountsLoaderArgs,
            context: RpcGraphQLContext,
            info?: GraphQLResolveInfo
        ) {
            return context.loaders.programAccounts.load(args, info);
        },
        transaction(
            _: unknown,
            args: TransactionLoaderArgs,
            context: RpcGraphQLContext,
            info?: GraphQLResolveInfo
        ) {
            return context.loaders.transaction.load(args, info);
        },
    },
};

export function createSolanaGraphQLSchema() {
    return makeExecutableSchema({
        resolvers: {
            ...accountResolvers,
            ...blockResolvers,
            ...commonResolvers,
            ...inputResolvers,
            ...instructionResolvers,
            ...scalarResolvers,
            ...schemaResolvers,
            ...transactionResolvers,
        },
        typeDefs: [
            accountTypeDefs,
            blockTypeDefs,
            commonTypeDefs,
            inputTypeDefs,
            instructionTypeDefs,
            scalarTypeDefs,
            schemaTypeDefs,
            transactionTypeDefs,
        ],
    });
}
