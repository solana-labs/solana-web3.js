import { accountResolvers } from '../resolvers/account';
import { blockResolvers } from '../resolvers/block';
import { instructionResolvers } from '../resolvers/instruction';
import { rootResolvers } from '../resolvers/root';
import { scalarResolvers } from '../resolvers/scalars';
import { transactionResolvers } from '../resolvers/transaction';
import { commonTypeResolvers } from '../resolvers/types';

export function createSolanaGraphQLResolvers() {
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
