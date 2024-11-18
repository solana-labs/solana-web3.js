import { IInstruction } from '@solana/instructions';
import { PublicKey } from '@solana/web3.js';

import { fromLegacyTransactionInstruction } from '../instructions';

{
    const instruction = {
        data: Buffer.from([]),
        keys: [{ isSigner: false, isWritable: false, pubkey: new PublicKey('') }],
        programId: new PublicKey(''),
    };
    fromLegacyTransactionInstruction(instruction) satisfies IInstruction;
}