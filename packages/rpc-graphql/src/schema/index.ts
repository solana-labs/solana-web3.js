import type { makeExecutableSchema } from '@graphql-tools/schema';

import { accountTypeDefs } from './account';
import { blockTypeDefs } from './block';
import { instructionTypeDefs } from './instruction';
import { rootTypeDefs } from './root';
import { transactionTypeDefs } from './transaction';
import { typeTypeDefs } from './types';

type TypeDefs = Parameters<typeof makeExecutableSchema>[0]['typeDefs'];

export function createSolanaGraphQLTypeDefs({ typeDefs }: { typeDefs?: TypeDefs }): TypeDefs {
    const schemaTypeDefs = [
        accountTypeDefs,
        blockTypeDefs,
        instructionTypeDefs,
        rootTypeDefs,
        typeTypeDefs,
        transactionTypeDefs,
    ] as TypeDefs[];
    if (typeDefs) {
        schemaTypeDefs.push(typeDefs);
    }
    return schemaTypeDefs;
}
