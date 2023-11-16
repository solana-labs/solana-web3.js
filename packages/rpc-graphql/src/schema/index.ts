import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphQLResolveInfo } from 'graphql';

import { RpcGraphQLContext } from '../context';
import { AccountQueryArgs, accountResolvers, accountTypeDefs } from './account';
import { BlockQueryArgs, blockResolvers, blockTypeDefs } from './block';
import { inputResolvers, inputTypeDefs } from './common/inputs';
import { scalarResolvers, scalarTypeDefs } from './common/scalars';
import { commonResolvers, commonTypeDefs } from './common/types';
import { instructionResolvers, instructionTypeDefs } from './instruction';
import { ProgramAccountsQueryArgs } from './program-accounts';
import { SimulateQueryArgs, simulateResolvers, simulateTypeDefs } from './simulate';
import { TransactionQueryArgs, transactionResolvers, transactionTypeDefs } from './transaction';

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
        simulate(
            transaction: String!
            accounts: SimulateAccounts
            commitment: Commitment
            encoding: SimulationEncoding
            minContextSlot: BigInt
            replaceRecentBlockhash: Boolean
            sigVerify: Boolean
        ): SimulationResult
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
            args: AccountQueryArgs,
            context: RpcGraphQLContext,
            info?: GraphQLResolveInfo
        ) {
            return context.loaders.account.load(args, info);
        },
        block(
            _: unknown,
            args: BlockQueryArgs,
            context: RpcGraphQLContext,
            info?: GraphQLResolveInfo
        ) {
            return context.loaders.block.load(args, info);
        },
        programAccounts(
            _: unknown,
            args: ProgramAccountsQueryArgs,
            context: RpcGraphQLContext,
            info?: GraphQLResolveInfo
        ) {
            return context.loaders.programAccounts.load(args, info);
        },
        simulate(
            _: unknown,
            args: SimulateQueryArgs,
            context: RpcGraphQLContext,
            info?: GraphQLResolveInfo
        ) {
            return context.loaders.simulate.load(args, info);
        },
        transaction(
            _: unknown,
            args: TransactionQueryArgs,
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
            ...simulateResolvers,
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
            simulateTypeDefs,
            transactionTypeDefs,
        ],
    });
}
