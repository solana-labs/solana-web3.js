import type { makeExecutableSchema } from '@graphql-tools/schema';

import { accountResolvers } from './account';
import { blockResolvers } from './block';
import { instructionResolvers } from './instruction';
import { rootResolvers } from './root';
import { transactionResolvers } from './transaction';
import { typeTypeResolvers } from './types';

export function createSolanaGraphQLResolvers(): Parameters<typeof makeExecutableSchema>[0]['resolvers'] {
    return {
        ...accountResolvers,
        ...blockResolvers,
        ...instructionResolvers,
        ...rootResolvers,
        ...transactionResolvers,
        ...typeTypeResolvers,
    };
}
