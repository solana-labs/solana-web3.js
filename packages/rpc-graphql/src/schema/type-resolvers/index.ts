import type { makeExecutableSchema } from '@graphql-tools/schema';

import { accountTypeResolvers } from './account';
import { blockTypeResolvers } from './block';
import { instructionTypeResolvers } from './instruction';
import { rootTypeResolvers } from './root';
import { transactionTypeResolvers } from './transaction';
import { typeTypeResolvers } from './types';

export function createSolanaGraphQLTypeResolvers(): Parameters<typeof makeExecutableSchema>[0]['resolvers'] {
    return {
        ...accountTypeResolvers,
        ...blockTypeResolvers,
        ...instructionTypeResolvers,
        ...rootTypeResolvers,
        ...transactionTypeResolvers,
        ...typeTypeResolvers,
    };
}
