import { AccountRole } from '@solana/instructions';
import { Keypair, TransactionInstruction } from '@solana/web3.js';

import { fromLegacyPublicKey } from '../address';
import { fromLegacyTransactionInstruction } from '../instruction';

describe('fromLegacyTransactionInstruction', () => {
    it('should convert a legacy TransactionInstruction to IInstruction', () => {
        const data = Buffer.from([1, 2, 3, 4]);
        const account1 = Keypair.generate().publicKey;
        const account2 = Keypair.generate().publicKey;
        const programId = Keypair.generate().publicKey;

        const legacyInstruction = new TransactionInstruction({
            data,
            keys: [
                { isSigner: true, isWritable: false, pubkey: account1 },
                { isSigner: false, isWritable: true, pubkey: account2 },
            ],
            programId: programId,
        });

        const result = fromLegacyTransactionInstruction(legacyInstruction);

        expect(result.accounts).toHaveLength(2);
        expect(result.data).toStrictEqual(data);
        expect(result.programAddress).toEqual(programId);

        expect(result.accounts[0]).toEqual({
            address: fromLegacyPublicKey(account1),
            role: AccountRole.WRITABLE
        });

        expect(result.accounts[1]).toEqual({
            address: fromLegacyPublicKey(account2),
            role: AccountRole.WRITABLE_SIGNER,
        });
    });
});
