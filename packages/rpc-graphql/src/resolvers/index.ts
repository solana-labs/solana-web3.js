import type { makeExecutableSchema } from '@graphql-tools/schema';

import { accountResolvers } from '../resolvers/account';
import { blockResolvers } from '../resolvers/block';
import { instructionResolvers } from '../resolvers/instruction';
import { rootResolvers } from '../resolvers/root';
import { transactionResolvers } from '../resolvers/transaction';
import { typeTypeResolvers } from '../resolvers/types';

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
