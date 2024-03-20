import { accountTypeDefs } from './account.js';
import { blockTypeDefs } from './block.js';
import { instructionTypeDefs } from './instruction.js';
import { rootTypeDefs } from './root.js';
import { transactionTypeDefs } from './transaction.js';
import { typeTypeDefs } from './types.js';

export function createSolanaGraphQLTypeDefs() {
    return [accountTypeDefs, blockTypeDefs, instructionTypeDefs, rootTypeDefs, typeTypeDefs, transactionTypeDefs];
}
