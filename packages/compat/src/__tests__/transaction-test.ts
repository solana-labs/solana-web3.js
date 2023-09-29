import { Base58EncodedAddress } from '@solana/addresses';
import { AccountRole, IInstruction } from '@solana/instructions';
import { PublicKey, TransactionInstruction, TransactionMessage, VersionedTransaction } from '@solana/web3.js';

import { fromOldVersionedTransactionWithBlockhash } from '../transaction';

describe('fromOldVersionedTransaction', () => {
    const lastValidBlockHeight = 1000n;

    const feePayerString = '7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK';
    const feePayerPublicKey = new PublicKey('7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK');

    const blockhashString = 'J4yED2jcMAHyQUg61DBmm4njmEydUr2WqrV9cdEcDDgL';

    describe('for a transaction with `legacy` version', () => {
        it('converts a transaction with no instructions', () => {
            const oldTransaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [],
                    payerKey: feePayerPublicKey,
                    recentBlockhash: blockhashString,
                }).compileToLegacyMessage()
            );

            const transaction = fromOldVersionedTransactionWithBlockhash(oldTransaction, lastValidBlockHeight);

            expect(transaction.version).toBe('legacy');
            expect(transaction.feePayer).toEqual(feePayerString);
            expect(transaction.lifetimeConstraint).toEqual({
                blockhash: blockhashString,
                lastValidBlockHeight,
            });
        });

        it('converts a transaction with one instruction with no accounts or data', () => {
            const programId = new PublicKey('HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf');

            const instruction = new TransactionInstruction({
                keys: [],
                programId,
            });

            const oldTransaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [instruction],
                    payerKey: feePayerPublicKey,
                    recentBlockhash: blockhashString,
                }).compileToLegacyMessage()
            );

            const transaction = fromOldVersionedTransactionWithBlockhash(oldTransaction, lastValidBlockHeight);

            const expectedInstruction: IInstruction = {
                programAddress: 'HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf' as Base58EncodedAddress,
            };

            expect(transaction.instructions).toStrictEqual([expectedInstruction]);
        });

        it('converts a transaction with one instruction with accounts and data', () => {
            const programId = new PublicKey('HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf');

            const accountMetas = [
                {
                    isSigner: false,
                    isWritable: false,
                    pubkey: new PublicKey('8kud9bpNvfemXYdTFjs5cZ8fZinBkx8JAnhVmRwJZk5e'),
                },
                {
                    isSigner: false,
                    isWritable: true,
                    pubkey: new PublicKey('3LeBzRE9Yna5zi9R8vdT3MiNQYuEp4gJgVyhhwmqfCtd'),
                },
                {
                    isSigner: true,
                    isWritable: false,
                    pubkey: new PublicKey('G35QeFd4jpXWfRkuRKwn8g4vYrmn8DWJ5v88Kkpd8z1V'),
                },
                {
                    isSigner: true,
                    isWritable: true,
                    pubkey: new PublicKey('H4RdPRWYk3pKw2CkNznxQK6J6herjgQke2pzFJW4GC6x'),
                },
            ];

            const instructionData = Buffer.from([0, 1, 2, 3, 4]);

            const instruction = new TransactionInstruction({
                data: instructionData,
                keys: accountMetas,
                programId,
            });

            const oldTransaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [instruction],
                    payerKey: feePayerPublicKey,
                    recentBlockhash: blockhashString,
                }).compileToLegacyMessage()
            );

            const transaction = fromOldVersionedTransactionWithBlockhash(oldTransaction, lastValidBlockHeight);

            const expectedInstruction: IInstruction = {
                accounts: [
                    {
                        address: '8kud9bpNvfemXYdTFjs5cZ8fZinBkx8JAnhVmRwJZk5e' as Base58EncodedAddress,
                        role: AccountRole.READONLY,
                    },
                    {
                        address: '3LeBzRE9Yna5zi9R8vdT3MiNQYuEp4gJgVyhhwmqfCtd' as Base58EncodedAddress,
                        role: AccountRole.WRITABLE,
                    },
                    {
                        address: 'G35QeFd4jpXWfRkuRKwn8g4vYrmn8DWJ5v88Kkpd8z1V' as Base58EncodedAddress,
                        role: AccountRole.READONLY_SIGNER,
                    },
                    {
                        address: 'H4RdPRWYk3pKw2CkNznxQK6J6herjgQke2pzFJW4GC6x' as Base58EncodedAddress,
                        role: AccountRole.WRITABLE_SIGNER,
                    },
                ],
                data: instructionData,
                programAddress: 'HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf' as Base58EncodedAddress,
            };

            expect(transaction.instructions).toStrictEqual([expectedInstruction]);
        });

        it('converts a transaction with multiple instructions', () => {
            const instructions = [
                new TransactionInstruction({
                    keys: [],
                    programId: new PublicKey('Cmqw16pVQvmW1b7Ek1ioQ5Ggf1PaoXi5XxsK9iVSbRKC'),
                }),
                new TransactionInstruction({
                    keys: [],
                    programId: new PublicKey('3hpECiFPtnyxoWqWqcVyfBUDhPKSZXWDduNXFywo8ncP'),
                }),
                new TransactionInstruction({
                    keys: [],
                    programId: new PublicKey('GJRYBLa6XpfswT1AN5tpGp8NHtUirwAdTPdSYXsW9L3S'),
                }),
            ];

            const oldTransaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions,
                    payerKey: feePayerPublicKey,
                    recentBlockhash: blockhashString,
                }).compileToLegacyMessage()
            );

            const transaction = fromOldVersionedTransactionWithBlockhash(oldTransaction, lastValidBlockHeight);

            const expectedInstructions: IInstruction[] = [
                {
                    programAddress: 'Cmqw16pVQvmW1b7Ek1ioQ5Ggf1PaoXi5XxsK9iVSbRKC' as Base58EncodedAddress,
                },
                {
                    programAddress: '3hpECiFPtnyxoWqWqcVyfBUDhPKSZXWDduNXFywo8ncP' as Base58EncodedAddress,
                },
                {
                    programAddress: 'GJRYBLa6XpfswT1AN5tpGp8NHtUirwAdTPdSYXsW9L3S' as Base58EncodedAddress,
                },
            ];

            expect(transaction.instructions).toStrictEqual(expectedInstructions);
        });
    });

    describe('for a transaction with `0` version', () => {
        it('converts a transaction with no instructions', () => {
            const oldTransaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [],
                    payerKey: feePayerPublicKey,
                    recentBlockhash: blockhashString,
                }).compileToV0Message()
            );

            const transaction = fromOldVersionedTransactionWithBlockhash(oldTransaction, lastValidBlockHeight);

            expect(transaction.version).toBe(0);
            expect(transaction.feePayer).toEqual(feePayerString);
            expect(transaction.lifetimeConstraint).toEqual({
                blockhash: blockhashString,
                lastValidBlockHeight,
            });
        });

        it('converts a transaction with one instruction with no accounts or data', () => {
            const programId = new PublicKey('HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf');

            const instruction = new TransactionInstruction({
                keys: [],
                programId,
            });

            const oldTransaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [instruction],
                    payerKey: feePayerPublicKey,
                    recentBlockhash: blockhashString,
                }).compileToV0Message()
            );

            const transaction = fromOldVersionedTransactionWithBlockhash(oldTransaction, lastValidBlockHeight);

            const expectedInstruction: IInstruction = {
                programAddress: 'HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf' as Base58EncodedAddress,
            };

            expect(transaction.instructions).toStrictEqual([expectedInstruction]);
        });

        it('converts a transaction with one instruction with accounts and data', () => {
            const programId = new PublicKey('HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf');

            const accountMetas = [
                {
                    isSigner: false,
                    isWritable: false,
                    pubkey: new PublicKey('8kud9bpNvfemXYdTFjs5cZ8fZinBkx8JAnhVmRwJZk5e'),
                },
                {
                    isSigner: false,
                    isWritable: true,
                    pubkey: new PublicKey('3LeBzRE9Yna5zi9R8vdT3MiNQYuEp4gJgVyhhwmqfCtd'),
                },
                {
                    isSigner: true,
                    isWritable: false,
                    pubkey: new PublicKey('G35QeFd4jpXWfRkuRKwn8g4vYrmn8DWJ5v88Kkpd8z1V'),
                },
                {
                    isSigner: true,
                    isWritable: true,
                    pubkey: new PublicKey('H4RdPRWYk3pKw2CkNznxQK6J6herjgQke2pzFJW4GC6x'),
                },
            ];

            const instructionData = Buffer.from([0, 1, 2, 3, 4]);

            const instruction = new TransactionInstruction({
                data: instructionData,
                keys: accountMetas,
                programId,
            });

            const oldTransaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [instruction],
                    payerKey: feePayerPublicKey,
                    recentBlockhash: blockhashString,
                }).compileToV0Message()
            );

            const transaction = fromOldVersionedTransactionWithBlockhash(oldTransaction, lastValidBlockHeight);

            const expectedInstruction: IInstruction = {
                accounts: [
                    {
                        address: '8kud9bpNvfemXYdTFjs5cZ8fZinBkx8JAnhVmRwJZk5e' as Base58EncodedAddress,
                        role: AccountRole.READONLY,
                    },
                    {
                        address: '3LeBzRE9Yna5zi9R8vdT3MiNQYuEp4gJgVyhhwmqfCtd' as Base58EncodedAddress,
                        role: AccountRole.WRITABLE,
                    },
                    {
                        address: 'G35QeFd4jpXWfRkuRKwn8g4vYrmn8DWJ5v88Kkpd8z1V' as Base58EncodedAddress,
                        role: AccountRole.READONLY_SIGNER,
                    },
                    {
                        address: 'H4RdPRWYk3pKw2CkNznxQK6J6herjgQke2pzFJW4GC6x' as Base58EncodedAddress,
                        role: AccountRole.WRITABLE_SIGNER,
                    },
                ],
                data: instructionData,
                programAddress: 'HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf' as Base58EncodedAddress,
            };

            expect(transaction.instructions).toStrictEqual([expectedInstruction]);
        });

        it('converts a transaction with multiple instructions', () => {
            const instructions = [
                new TransactionInstruction({
                    keys: [],
                    programId: new PublicKey('Cmqw16pVQvmW1b7Ek1ioQ5Ggf1PaoXi5XxsK9iVSbRKC'),
                }),
                new TransactionInstruction({
                    keys: [],
                    programId: new PublicKey('3hpECiFPtnyxoWqWqcVyfBUDhPKSZXWDduNXFywo8ncP'),
                }),
                new TransactionInstruction({
                    keys: [],
                    programId: new PublicKey('GJRYBLa6XpfswT1AN5tpGp8NHtUirwAdTPdSYXsW9L3S'),
                }),
            ];

            const oldTransaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions,
                    payerKey: feePayerPublicKey,
                    recentBlockhash: blockhashString,
                }).compileToV0Message()
            );

            const transaction = fromOldVersionedTransactionWithBlockhash(oldTransaction, lastValidBlockHeight);

            const expectedInstructions: IInstruction[] = [
                {
                    programAddress: 'Cmqw16pVQvmW1b7Ek1ioQ5Ggf1PaoXi5XxsK9iVSbRKC' as Base58EncodedAddress,
                },
                {
                    programAddress: '3hpECiFPtnyxoWqWqcVyfBUDhPKSZXWDduNXFywo8ncP' as Base58EncodedAddress,
                },
                {
                    programAddress: 'GJRYBLa6XpfswT1AN5tpGp8NHtUirwAdTPdSYXsW9L3S' as Base58EncodedAddress,
                },
            ];

            expect(transaction.instructions).toStrictEqual(expectedInstructions);
        });
    });
});
