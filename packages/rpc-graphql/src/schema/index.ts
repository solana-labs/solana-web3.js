import { accountTypeDefs } from './account';
import { blockTypeDefs } from './block';
import { inputTypeDefs } from './common/inputs';
import { scalarTypeDefs } from './common/scalars';
import { commonTypeDefs } from './common/types';
import { instructionTypeDefs } from './instruction';
import { rootTypeDefs } from './root';
import { transactionTypeDefs } from './transaction';

export function createSolanaGraphQLTypeDefs() {
    return [
        accountTypeDefs,
        blockTypeDefs,
        commonTypeDefs,
        inputTypeDefs,
        instructionTypeDefs,
        rootTypeDefs,
        scalarTypeDefs,
        transactionTypeDefs,
    ];
}
