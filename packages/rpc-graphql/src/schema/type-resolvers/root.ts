import type { makeExecutableSchema } from '@graphql-tools/schema';

import { resolveAccount } from '../../resolvers/account';
import { resolveBlock } from '../../resolvers/block';
import { resolveProgramAccounts } from '../../resolvers/program-accounts';
import { resolveTransaction } from '../../resolvers/transaction';

export const rootTypeResolvers: Parameters<typeof makeExecutableSchema>[0]['resolvers'] = {
    Query: {
        account: resolveAccount(),
        block: resolveBlock(),
        programAccounts: resolveProgramAccounts(),
        transaction: resolveTransaction(),
    },
};
