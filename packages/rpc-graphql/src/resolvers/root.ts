import type { makeExecutableSchema } from '@graphql-tools/schema';

import { resolveAccount } from './account.js';
import { resolveBlock } from './block.js';
import { resolveProgramAccounts } from './program-accounts.js';
import { resolveTransaction } from './transaction.js';

export const rootResolvers: Parameters<typeof makeExecutableSchema>[0]['resolvers'] = {
    Query: {
        account: resolveAccount(),
        block: resolveBlock(),
        programAccounts: resolveProgramAccounts(),
        transaction: resolveTransaction(),
    },
};
