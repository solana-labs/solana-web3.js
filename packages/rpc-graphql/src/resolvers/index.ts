import type { makeExecutableSchema } from '@graphql-tools/schema';

import { accountResolvers } from '../resolvers/account';
import { blockResolvers } from '../resolvers/block';
import { instructionResolvers } from '../resolvers/instruction';
import { rootResolvers } from '../resolvers/root';
import { scalarResolvers } from '../resolvers/scalars';
import { transactionResolvers } from '../resolvers/transaction';
import { commonTypeResolvers } from '../resolvers/types';

export function createSolanaGraphQLResolvers(): Parameters<typeof makeExecutableSchema>[0]['resolvers'] {
    return {
        ...accountResolvers,
        ...blockResolvers,
        ...commonTypeResolvers,
        ...instructionResolvers,
        ...rootResolvers,
        ...scalarResolvers,
        ...transactionResolvers,
    };
}
