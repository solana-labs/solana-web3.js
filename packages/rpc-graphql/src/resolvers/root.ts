import type { makeExecutableSchema } from '@graphql-tools/schema';

import { resolveAccount } from './account';
import { resolveBlock } from './block';
import { resolveProgramAccounts } from './program-accounts';
import { resolveTransaction } from './transaction';

export const rootResolvers: Parameters<typeof makeExecutableSchema>[0]['resolvers'] = {
    Query: {
        account: resolveAccount(),
        block: resolveBlock(),
        programAccounts: resolveProgramAccounts(),
        transaction: resolveTransaction(),
    },
};
