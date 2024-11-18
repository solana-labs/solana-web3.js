import { Address } from '@solana/addresses';
import { Keypair, TransactionInstruction } from '@solana/web3.js';

import { fromLegacyTransactionInstruction } from '../instruction';

describe('fromLegacyTransactionInstruction', () => {
    it('should convert a legacy TransactionInstruction to IInstruction', () => {
        const keypair1 = Keypair.generate();
        const keypair2 = Keypair.generate();
        const programId = Keypair.generate().publicKey;

        const legacyInstruction = new TransactionInstruction({
            data: Buffer.from([1, 2, 3, 4]),
            keys: [
                { isSigner: true, isWritable: true, pubkey: keypair1.publicKey },
                { isSigner: false, isWritable: false, pubkey: keypair2.publicKey },
            ],
            programId: programId,
        });

        const result = fromLegacyTransactionInstruction(legacyInstruction);

        expect(result.accounts).toHaveLength(2);
        expect(result.accounts[0]).toEqual({
            address: keypair1.publicKey as Address,
            role: {
                isSigner: true,
                isWritable: true,
            },
        });
        expect(result.accounts[1]).toEqual({
            address: keypair2.publicKey as Address,
            role: {
                isSigner: false,
                isWritable: false,
            },
        });
        expect(result.data).toEqual(new Uint8Array([1, 2, 3, 4]));
        expect(result.programAddress).toEqual(programId as Address);
    });
});
