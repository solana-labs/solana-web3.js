import { IInstruction } from '@solana/instructions';
import { TransactionInstruction } from '@solana/web3.js';

import { fromLegacyTransactionInstruction } from '../instruction';

{
    const instruction = null as unknown as TransactionInstruction;
    fromLegacyTransactionInstruction(instruction) satisfies IInstruction;
}
