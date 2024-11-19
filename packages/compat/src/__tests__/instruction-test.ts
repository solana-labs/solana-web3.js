import { IInstruction } from '@solana/instructions';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

import { fromLegacyTransactionInstruction } from '../instruction'; // Adjust the import path as needed

describe('fromLegacyTransactionInstruction', () => {
    it('converts a basic TransactionInstruction', () => {
        const programId = new Uint8Array([1, 2, 3, 4]);
        const keys = [
            { pubkey: new PublicKey('7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK'), isSigner: false, isWritable: true },
        ];
        const data = new Uint8Array([10, 20, 30]);

        const instruction = new TransactionInstruction({
            data: Buffer.from(data),
            keys,
            programId: new PublicKey(programId),
        });

        const converted = fromLegacyTransactionInstruction(instruction);

        expect(converted).toMatchObject<IInstruction>({
            data: Buffer.from(data),
            keys: [
                {
                    isSigner: false,
                    isWritable: true,
                    pubkey: '7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK',
                },
            ],
            programId: programId.toString(),
        });
    });

    it('handles an instruction with no keys', () => {
        const programId = new Uint8Array([5, 6, 7, 8]);
        const data = new Uint8Array([40, 50, 60]);

        const instruction = new TransactionInstruction({
            data: Buffer.from(data),
            keys: [],
            programId: new PublicKey(programId),
        });

        const converted = fromLegacyTransactionInstruction(instruction);

        expect(converted).toMatchObject<IInstruction>({
            data: Buffer.from(data),
            keys: [],
            programId: programId.toString(),
        });
    });

    it('handles an instruction with multiple keys', () => {
        const programId = new Uint8Array([9, 10, 11, 12]);
        const keys = [
            { pubkey: new PublicKey('7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK'), isSigner: true, isWritable: true },
            { pubkey: new PublicKey('9A87Qt8sxxLMe7hcrjC4cPnho1CwWKRpk84ZTRPyvWNw'), isSigner: false, isWritable: false },
        ];
        const data = new Uint8Array([70, 80, 90]);

        const instruction = new TransactionInstruction({
            data: Buffer.from(data),
            keys,
            programId: new PublicKey(programId),
        });

        const converted = fromLegacyTransactionInstruction(instruction);

        expect(converted).toMatchObject<IInstruction>({
            data: Buffer.from(data),
            keys: [
                {
                    isSigner: true,
                    isWritable: true,
                    pubkey: '7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK',
                },
                {
                    isSigner: false,
                    isWritable: false,
                    pubkey: '9A87Qt8sxxLMe7hcrjC4cPnho1CwWKRpk84ZTRPyvWNw',
                },
            ],
            programId: programId.toString(),
        });
    });

    it('handles an empty data field gracefully', () => {
        const programId = new Uint8Array([13, 14, 15, 16]);
        const keys = [
            { pubkey: new PublicKey('F7Kzv7G6p1PvHXL1xXLPTm4myKWpLjnVphCV8ABZJfgT'), isSigner: true, isWritable: false },
        ];

        const instruction = new TransactionInstruction({
            data: Buffer.from(new Uint8Array()),
            keys,
            programId: new PublicKey(programId),
        });

        const converted = fromLegacyTransactionInstruction(instruction);

        expect(converted).toMatchObject<IInstruction>({
            data: Buffer.from([]),
            keys: [
                {
                    isSigner: true,
                    isWritable: false,
                    pubkey: 'F7Kzv7G6p1PvHXL1xXLPTm4myKWpLjnVphCV8ABZJfgT',
                },
            ],
            programId: programId.toString(),
        });
    });
});
