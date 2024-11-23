import { address } from '@solana/addresses';
import { AccountRole, IInstruction } from '@solana/instructions';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

import { fromLegacyPublicKey } from '../address';
import { fromLegacyTransactionInstruction } from '../instruction';

describe('fromLegacyTransactionInstruction', () => {
    it('converts a basic TransactionInstruction', () => {
        const programId = new Uint8Array([1, 2, 3, 4]);
        const keys = [
            {
                isSigner: false,
                isWritable: true,
                pubkey: new PublicKey('7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK'),
            },
        ];
        const data = new Uint8Array([10, 20, 30]);

        const instruction = new TransactionInstruction({
            data: Buffer.from(data),
            keys,
            programId: new PublicKey(programId),
        });

        const converted = fromLegacyTransactionInstruction(instruction);

        expect(converted).toMatchObject<IInstruction>({
            accounts: [
                {
                    address: address('7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK'),
                    role: AccountRole.WRITABLE,
                },
            ],
            data: Buffer.from(data),
            programAddress: fromLegacyPublicKey(new PublicKey(programId)),
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
            accounts: [],
            data: Buffer.from(data),
            programAddress: fromLegacyPublicKey(new PublicKey(programId)),
        });
    });

    it('handles an instruction with multiple keys', () => {
        const programId = new Uint8Array([9, 10, 11, 12]);
        const keys = [
            { isSigner: true, isWritable: true, pubkey: new PublicKey('7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK') },
            {
                isSigner: false,
                isWritable: false,
                pubkey: new PublicKey('9A87Qt8sxxLMe7hcrjC4cPnho1CwWKRpk84ZTRPyvWNw'),
            },
        ];
        const data = new Uint8Array([70, 80, 90]);

        const instruction = new TransactionInstruction({
            data: Buffer.from(data),
            keys,
            programId: new PublicKey(programId),
        });

        const converted = fromLegacyTransactionInstruction(instruction);

        expect(converted).toMatchObject<IInstruction>({
            accounts: [
                {
                    address: address('7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK'),
                    role: AccountRole.WRITABLE_SIGNER,
                },
                {
                    address: address('9A87Qt8sxxLMe7hcrjC4cPnho1CwWKRpk84ZTRPyvWNw'),
                    role: AccountRole.READONLY,
                },
            ],
            data: Buffer.from(data),
            programAddress: fromLegacyPublicKey(new PublicKey(programId)),
        });
    });

    it('handles an empty data field gracefully', () => {
        const programId = new Uint8Array([13, 14, 15, 16]);
        const keys = [
            {
                isSigner: true,
                isWritable: false,
                pubkey: new PublicKey('F7Kzv7G6p1PvHXL1xXLPTm4myKWpLjnVphCV8ABZJfgT'),
            },
        ];

        const instruction = new TransactionInstruction({
            data: Buffer.from(new Uint8Array()),
            keys,
            programId: new PublicKey(programId),
        });

        const converted = fromLegacyTransactionInstruction(instruction);

        expect(converted).toMatchObject<IInstruction>({
            accounts: [
                {
                    address: address('F7Kzv7G6p1PvHXL1xXLPTm4myKWpLjnVphCV8ABZJfgT'),
                    role: AccountRole.READONLY_SIGNER,
                },
            ],
            data: Buffer.from([]),
            programAddress: fromLegacyPublicKey(new PublicKey(programId)),
        });
    });
});
