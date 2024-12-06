import { IInstruction } from '@solana/instructions/src';
import { TransactionInstruction } from '@solana/web3.js';

import { fromLegacyTransactionInstruction } from '../instruction';

// Mock legacy TransactionInstruction
const legacyInstruction = null as unknown as TransactionInstruction;

// Ensure that the output of fromLegacyTransactionInstruction satisfies the IInstruction type
fromLegacyTransactionInstruction(legacyInstruction) satisfies IInstruction;
