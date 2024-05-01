import type { makeExecutableSchema } from '@graphql-tools/schema';

import { resolveAccount, resolveMultipleAccounts } from './account';
import { resolveBlock } from './block';
import { resolveProgramAccounts } from './program-accounts';
import { resolveTransaction } from './transaction';

export const rootResolvers: Parameters<typeof makeExecutableSchema>[0]['resolvers'] = {
    Query: {
        account: resolveAccount(),
        block: resolveBlock(),
        multipleAccounts: resolveMultipleAccounts(),
        programAccounts: resolveProgramAccounts(),
        transaction: resolveTransaction(),
    },
};
