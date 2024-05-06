import { accountTypeDefs } from './account';
import { blockTypeDefs } from './block';
import { instructionTypeDefs } from './instruction';
import { rootTypeDefs } from './root';
import { transactionTypeDefs } from './transaction';
import { typeTypeDefs } from './types';

export function createSolanaGraphQLTypeDefs() {
    return [accountTypeDefs, blockTypeDefs, instructionTypeDefs, rootTypeDefs, typeTypeDefs, transactionTypeDefs];
}
