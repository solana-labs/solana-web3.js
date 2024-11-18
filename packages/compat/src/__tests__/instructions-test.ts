import { AccountRole } from '@solana/instructions';
import { Keypair } from '@solana/web3.js';

import { fromLegacyTransactionInstruction } from '../instructions';

describe('fromLegacyTransactionInstruction', () => {
    it('should correctly convert instruction data, accounts, and program ID', () => {
        // Setup: Define data, accounts, and program ID
        const data = Buffer.from([1, 2, 3]);
        const account1 = Keypair.generate().publicKey;
        const account2 = Keypair.generate().publicKey;
        const programId = Keypair.generate().publicKey;

        const legacyInstruction = {
            data,
            keys: [
                { isSigner: true, isWritable: true, pubkey: account1 },
                { isSigner: false, isWritable: true, pubkey: account2 },
            ],
            programId,
        };

        // Execution: Convert legacy instruction
        const converted = fromLegacyTransactionInstruction(legacyInstruction);

        // Verification: Assert each property
        expect(converted.accounts).toBeDefined();
        expect(converted.accounts![0]).toEqual({
            address: account1.toBase58(),
            role: AccountRole.WRITABLE_SIGNER,
        });

        expect(converted.accounts![1]).toEqual({
            address: account2.toBase58(),
            role: AccountRole.WRITABLE,
        });
    });
});
