import { Base58EncodedAddress } from '@solana/addresses';
import { AccountRole, IInstruction } from '@solana/instructions';
import { Ed25519Signature } from '@solana/keys';
import { ITransactionWithSignatures } from '@solana/transactions';
import { PublicKey, TransactionInstruction, TransactionMessage, VersionedTransaction } from '@solana/web3.js';

import { fromVersionedTransactionWithBlockhash } from '../transaction';

describe('fromVersionedTransaction', () => {
    const U64_MAX = 2n ** 64n - 1n;
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

            const transaction = fromVersionedTransactionWithBlockhash(oldTransaction);

            expect(transaction.version).toBe('legacy');
            expect(transaction.feePayer).toEqual(feePayerString);
            expect(transaction.lifetimeConstraint).toEqual({
                blockhash: blockhashString,
                lastValidBlockHeight: U64_MAX,
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

            const transaction = fromVersionedTransactionWithBlockhash(oldTransaction);

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

            const transaction = fromVersionedTransactionWithBlockhash(oldTransaction);

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

            const transaction = fromVersionedTransactionWithBlockhash(oldTransaction);

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

        it('converts a transaction with a single signer', () => {
            const oldTransaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [],
                    payerKey: feePayerPublicKey,
                    recentBlockhash: blockhashString,
                }).compileToLegacyMessage()
            );

            const feePayerSignature = new Uint8Array(Array(64).fill(1));
            oldTransaction.addSignature(feePayerPublicKey, feePayerSignature);

            const transaction = fromVersionedTransactionWithBlockhash(
                oldTransaction
            ) as unknown as ITransactionWithSignatures;

            expect(transaction.signatures).toStrictEqual({
                '7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK': feePayerSignature as Ed25519Signature,
            });
        });

        it('converts a transaction with multiple signers', () => {
            const otherSigner1PublicKey = new PublicKey('8kud9bpNvfemXYdTFjs5cZ8fZinBkx8JAnhVmRwJZk5e');
            const otherSigner2PublicKey = new PublicKey('3LeBzRE9Yna5zi9R8vdT3MiNQYuEp4gJgVyhhwmqfCtd');

            const accountMetasSigners = [
                {
                    isSigner: true,
                    isWritable: false,
                    pubkey: otherSigner1PublicKey,
                },
                {
                    isSigner: true,
                    isWritable: false,
                    pubkey: otherSigner2PublicKey,
                },
            ];

            const oldTransaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [
                        new TransactionInstruction({
                            keys: accountMetasSigners,
                            programId: new PublicKey('HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf'),
                        }),
                    ],
                    payerKey: feePayerPublicKey,
                    recentBlockhash: blockhashString,
                }).compileToLegacyMessage()
            );

            const feePayerSignature = new Uint8Array(Array(64).fill(1));
            const otherSignature1 = new Uint8Array(Array(64).fill(2));
            const otherSignature2 = new Uint8Array(Array(64).fill(3));

            oldTransaction.addSignature(feePayerPublicKey, feePayerSignature);
            oldTransaction.addSignature(otherSigner1PublicKey, otherSignature1);
            oldTransaction.addSignature(otherSigner2PublicKey, otherSignature2);

            const transaction = fromVersionedTransactionWithBlockhash(
                oldTransaction
            ) as unknown as ITransactionWithSignatures;

            expect(transaction.signatures).toStrictEqual({
                '3LeBzRE9Yna5zi9R8vdT3MiNQYuEp4gJgVyhhwmqfCtd': new Uint8Array(Array(64).fill(3)),
                '7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK': new Uint8Array(Array(64).fill(1)) as Ed25519Signature,
                '8kud9bpNvfemXYdTFjs5cZ8fZinBkx8JAnhVmRwJZk5e': new Uint8Array(Array(64).fill(2)) as Ed25519Signature,
            });
        });

        it('converts a partially signed transaction with multiple signers', () => {
            const otherSigner1PublicKey = new PublicKey('8kud9bpNvfemXYdTFjs5cZ8fZinBkx8JAnhVmRwJZk5e');
            const otherSigner2PublicKey = new PublicKey('3LeBzRE9Yna5zi9R8vdT3MiNQYuEp4gJgVyhhwmqfCtd');

            const accountMetasSigners = [
                {
                    isSigner: true,
                    isWritable: false,
                    pubkey: otherSigner1PublicKey,
                },
                {
                    isSigner: true,
                    isWritable: false,
                    pubkey: otherSigner2PublicKey,
                },
            ];

            const oldTransaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [
                        new TransactionInstruction({
                            keys: accountMetasSigners,
                            programId: new PublicKey('HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf'),
                        }),
                    ],
                    payerKey: feePayerPublicKey,
                    recentBlockhash: blockhashString,
                }).compileToLegacyMessage()
            );

            const feePayerSignature = new Uint8Array(Array(64).fill(1));
            const otherSignature2 = new Uint8Array(Array(64).fill(3));

            oldTransaction.addSignature(feePayerPublicKey, feePayerSignature);
            oldTransaction.addSignature(otherSigner2PublicKey, otherSignature2);

            const transaction = fromVersionedTransactionWithBlockhash(
                oldTransaction
            ) as unknown as ITransactionWithSignatures;

            expect(transaction.signatures).toStrictEqual({
                '3LeBzRE9Yna5zi9R8vdT3MiNQYuEp4gJgVyhhwmqfCtd': new Uint8Array(Array(64).fill(3)),
                '7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK': new Uint8Array(Array(64).fill(1)),
            });
        });

        it('converts a transaction with a given lastValidBlockHeight', () => {
            const oldTransaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [],
                    payerKey: feePayerPublicKey,
                    recentBlockhash: blockhashString,
                }).compileToLegacyMessage()
            );

            const transaction = fromVersionedTransactionWithBlockhash(oldTransaction, 100n);

            expect(transaction.lifetimeConstraint).toEqual({
                blockhash: blockhashString,
                lastValidBlockHeight: 100n,
            });
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

            const transaction = fromVersionedTransactionWithBlockhash(oldTransaction);

            expect(transaction.version).toBe(0);
            expect(transaction.feePayer).toEqual(feePayerString);
            expect(transaction.lifetimeConstraint).toEqual({
                blockhash: blockhashString,
                lastValidBlockHeight: U64_MAX,
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

            const transaction = fromVersionedTransactionWithBlockhash(oldTransaction);

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

            const transaction = fromVersionedTransactionWithBlockhash(oldTransaction);

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

            const transaction = fromVersionedTransactionWithBlockhash(oldTransaction);

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

        it('converts a transaction with a single signer', () => {
            const oldTransaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [],
                    payerKey: feePayerPublicKey,
                    recentBlockhash: blockhashString,
                }).compileToV0Message()
            );

            const feePayerSignature = new Uint8Array(Array(64).fill(1));
            oldTransaction.addSignature(feePayerPublicKey, feePayerSignature);

            const transaction = fromVersionedTransactionWithBlockhash(
                oldTransaction
            ) as unknown as ITransactionWithSignatures;

            expect(transaction.signatures).toStrictEqual({
                '7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK': feePayerSignature as Ed25519Signature,
            });
        });

        it('converts a transaction with multiple signers', () => {
            const otherSigner1PublicKey = new PublicKey('8kud9bpNvfemXYdTFjs5cZ8fZinBkx8JAnhVmRwJZk5e');
            const otherSigner2PublicKey = new PublicKey('3LeBzRE9Yna5zi9R8vdT3MiNQYuEp4gJgVyhhwmqfCtd');

            const accountMetasSigners = [
                {
                    isSigner: true,
                    isWritable: false,
                    pubkey: otherSigner1PublicKey,
                },
                {
                    isSigner: true,
                    isWritable: false,
                    pubkey: otherSigner2PublicKey,
                },
            ];

            const oldTransaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [
                        new TransactionInstruction({
                            keys: accountMetasSigners,
                            programId: new PublicKey('HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf'),
                        }),
                    ],
                    payerKey: feePayerPublicKey,
                    recentBlockhash: blockhashString,
                }).compileToV0Message()
            );

            const feePayerSignature = new Uint8Array(Array(64).fill(1));
            const otherSignature1 = new Uint8Array(Array(64).fill(2));
            const otherSignature2 = new Uint8Array(Array(64).fill(3));

            oldTransaction.addSignature(feePayerPublicKey, feePayerSignature);
            oldTransaction.addSignature(otherSigner1PublicKey, otherSignature1);
            oldTransaction.addSignature(otherSigner2PublicKey, otherSignature2);

            const transaction = fromVersionedTransactionWithBlockhash(
                oldTransaction
            ) as unknown as ITransactionWithSignatures;

            expect(transaction.signatures).toStrictEqual({
                '3LeBzRE9Yna5zi9R8vdT3MiNQYuEp4gJgVyhhwmqfCtd': new Uint8Array(Array(64).fill(3)),
                '7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK': new Uint8Array(Array(64).fill(1)) as Ed25519Signature,
                '8kud9bpNvfemXYdTFjs5cZ8fZinBkx8JAnhVmRwJZk5e': new Uint8Array(Array(64).fill(2)) as Ed25519Signature,
            });
        });

        it('converts a partially signed transaction with multiple signers', () => {
            const otherSigner1PublicKey = new PublicKey('8kud9bpNvfemXYdTFjs5cZ8fZinBkx8JAnhVmRwJZk5e');
            const otherSigner2PublicKey = new PublicKey('3LeBzRE9Yna5zi9R8vdT3MiNQYuEp4gJgVyhhwmqfCtd');

            const accountMetasSigners = [
                {
                    isSigner: true,
                    isWritable: false,
                    pubkey: otherSigner1PublicKey,
                },
                {
                    isSigner: true,
                    isWritable: false,
                    pubkey: otherSigner2PublicKey,
                },
            ];

            const oldTransaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [
                        new TransactionInstruction({
                            keys: accountMetasSigners,
                            programId: new PublicKey('HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf'),
                        }),
                    ],
                    payerKey: feePayerPublicKey,
                    recentBlockhash: blockhashString,
                }).compileToV0Message()
            );

            const feePayerSignature = new Uint8Array(Array(64).fill(1));
            const otherSignature2 = new Uint8Array(Array(64).fill(3));

            oldTransaction.addSignature(feePayerPublicKey, feePayerSignature);
            oldTransaction.addSignature(otherSigner2PublicKey, otherSignature2);

            const transaction = fromVersionedTransactionWithBlockhash(
                oldTransaction
            ) as unknown as ITransactionWithSignatures;

            expect(transaction.signatures).toStrictEqual({
                '3LeBzRE9Yna5zi9R8vdT3MiNQYuEp4gJgVyhhwmqfCtd': new Uint8Array(Array(64).fill(3)),
                '7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK': new Uint8Array(Array(64).fill(1)),
            });
        });

        it('converts a transaction with a given lastValidBlockHeight', () => {
            const oldTransaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [],
                    payerKey: feePayerPublicKey,
                    recentBlockhash: blockhashString,
                }).compileToV0Message()
            );

            const transaction = fromVersionedTransactionWithBlockhash(oldTransaction, 100n);

            expect(transaction.lifetimeConstraint).toEqual({
                blockhash: blockhashString,
                lastValidBlockHeight: 100n,
            });
        });
    });
});
