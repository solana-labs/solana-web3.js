import type { makeExecutableSchema } from '@graphql-tools/schema';

import { accountResolvers } from '../resolvers/account.js';
import { blockResolvers } from '../resolvers/block.js';
import { instructionResolvers } from '../resolvers/instruction.js';
import { rootResolvers } from '../resolvers/root.js';
import { transactionResolvers } from '../resolvers/transaction.js';
import { typeTypeResolvers } from '../resolvers/types.js';

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
