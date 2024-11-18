import { AccountRole } from '@solana/instructions';
import { Keypair } from '@solana/web3.js';

import { fromLegacyTransactionInstruction } from '../instruction';

describe('fromLegacyTransactionInstruction', () => {
    it('converts instruction data, accounts and program ID correctly', () => {
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

        const converted = fromLegacyTransactionInstruction(legacyInstruction);

        expect(converted.data).toStrictEqual(new Uint8Array(data));
        expect(converted.programAddress).toBe(programId.toBase58());
        expect(converted.accounts).toHaveLength(2);
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
