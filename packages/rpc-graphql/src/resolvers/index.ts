import type { makeExecutableSchema } from '@graphql-tools/schema';

import { accountResolvers } from './account';
import { blockResolvers } from './block';
import { instructionResolvers } from './instruction';
import { rootResolvers } from './root';
import { transactionResolvers } from './transaction';
import { typeTypeResolvers } from './types';

type Resolvers = Parameters<typeof makeExecutableSchema>[0]['resolvers'];

export function createSolanaGraphQLResolvers({
    queryResolvers,
    typeResolvers,
}: {
    queryResolvers?: Resolvers;
    typeResolvers?: Resolvers;
}): Resolvers {
    return {
        Query: {
            ...queryResolvers,
            ...rootResolvers,
        },
        ...accountResolvers,
        ...blockResolvers,
        ...instructionResolvers,
        ...transactionResolvers,
        ...typeResolvers,
        ...typeTypeResolvers,
    };
}
