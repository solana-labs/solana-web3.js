import { Buffer } from 'node:buffer';

import { Address } from '@solana/addresses';
import {
    SOLANA_ERROR__TRANSACTION__INVALID_NONCE_TRANSACTION_FIRST_INSTRUCTION_MUST_BE_ADVANCE_NONCE,
    SOLANA_ERROR__TRANSACTION__INVALID_NONCE_TRANSACTION_INSTRUCTIONS_MISSING,
    SolanaError,
} from '@solana/errors';
import { AccountRole, IInstruction } from '@solana/instructions';
import { SignatureBytes } from '@solana/keys';
import { ITransactionWithSignatures, Nonce } from '@solana/transactions';
import { PublicKey, TransactionInstruction, TransactionMessage, VersionedTransaction } from '@solana/web3.js';

import { fromVersionedTransactionWithBlockhash, fromVersionedTransactionWithDurableNonce } from '../transaction';

describe('fromVersionedTransactionWithBlockhash', () => {
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
                }).compileToLegacyMessage(),
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
                }).compileToLegacyMessage(),
            );

            const transaction = fromVersionedTransactionWithBlockhash(oldTransaction);

            const expectedInstruction: IInstruction = {
                programAddress: 'HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf' as Address,
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
                }).compileToLegacyMessage(),
            );

            const transaction = fromVersionedTransactionWithBlockhash(oldTransaction);

            const expectedInstruction: IInstruction = {
                accounts: [
                    {
                        address: '8kud9bpNvfemXYdTFjs5cZ8fZinBkx8JAnhVmRwJZk5e' as Address,
                        role: AccountRole.READONLY,
                    },
                    {
                        address: '3LeBzRE9Yna5zi9R8vdT3MiNQYuEp4gJgVyhhwmqfCtd' as Address,
                        role: AccountRole.WRITABLE,
                    },
                    {
                        address: 'G35QeFd4jpXWfRkuRKwn8g4vYrmn8DWJ5v88Kkpd8z1V' as Address,
                        role: AccountRole.READONLY_SIGNER,
                    },
                    {
                        address: 'H4RdPRWYk3pKw2CkNznxQK6J6herjgQke2pzFJW4GC6x' as Address,
                        role: AccountRole.WRITABLE_SIGNER,
                    },
                ],
                data: instructionData,
                programAddress: 'HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf' as Address,
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
                }).compileToLegacyMessage(),
            );

            const transaction = fromVersionedTransactionWithBlockhash(oldTransaction);

            const expectedInstructions: IInstruction[] = [
                {
                    programAddress: 'Cmqw16pVQvmW1b7Ek1ioQ5Ggf1PaoXi5XxsK9iVSbRKC' as Address,
                },
                {
                    programAddress: '3hpECiFPtnyxoWqWqcVyfBUDhPKSZXWDduNXFywo8ncP' as Address,
                },
                {
                    programAddress: 'GJRYBLa6XpfswT1AN5tpGp8NHtUirwAdTPdSYXsW9L3S' as Address,
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
                }).compileToLegacyMessage(),
            );

            const feePayerSignature = new Uint8Array(Array(64).fill(1));
            oldTransaction.addSignature(feePayerPublicKey, feePayerSignature);

            const transaction = fromVersionedTransactionWithBlockhash(
                oldTransaction,
            ) as unknown as ITransactionWithSignatures;

            expect(transaction.signatures).toStrictEqual({
                '7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK': feePayerSignature as SignatureBytes,
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
                }).compileToLegacyMessage(),
            );

            const feePayerSignature = new Uint8Array(Array(64).fill(1));
            const otherSignature1 = new Uint8Array(Array(64).fill(2));
            const otherSignature2 = new Uint8Array(Array(64).fill(3));

            oldTransaction.addSignature(feePayerPublicKey, feePayerSignature);
            oldTransaction.addSignature(otherSigner1PublicKey, otherSignature1);
            oldTransaction.addSignature(otherSigner2PublicKey, otherSignature2);

            const transaction = fromVersionedTransactionWithBlockhash(
                oldTransaction,
            ) as unknown as ITransactionWithSignatures;

            expect(transaction.signatures).toStrictEqual({
                '3LeBzRE9Yna5zi9R8vdT3MiNQYuEp4gJgVyhhwmqfCtd': new Uint8Array(Array(64).fill(3)),
                '7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK': new Uint8Array(Array(64).fill(1)) as SignatureBytes,
                '8kud9bpNvfemXYdTFjs5cZ8fZinBkx8JAnhVmRwJZk5e': new Uint8Array(Array(64).fill(2)) as SignatureBytes,
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
                }).compileToLegacyMessage(),
            );

            const feePayerSignature = new Uint8Array(Array(64).fill(1));
            const otherSignature2 = new Uint8Array(Array(64).fill(3));

            oldTransaction.addSignature(feePayerPublicKey, feePayerSignature);
            oldTransaction.addSignature(otherSigner2PublicKey, otherSignature2);

            const transaction = fromVersionedTransactionWithBlockhash(
                oldTransaction,
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
                }).compileToLegacyMessage(),
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
                }).compileToV0Message(),
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
                }).compileToV0Message(),
            );

            const transaction = fromVersionedTransactionWithBlockhash(oldTransaction);

            const expectedInstruction: IInstruction = {
                programAddress: 'HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf' as Address,
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
                }).compileToV0Message(),
            );

            const transaction = fromVersionedTransactionWithBlockhash(oldTransaction);

            const expectedInstruction: IInstruction = {
                accounts: [
                    {
                        address: '8kud9bpNvfemXYdTFjs5cZ8fZinBkx8JAnhVmRwJZk5e' as Address,
                        role: AccountRole.READONLY,
                    },
                    {
                        address: '3LeBzRE9Yna5zi9R8vdT3MiNQYuEp4gJgVyhhwmqfCtd' as Address,
                        role: AccountRole.WRITABLE,
                    },
                    {
                        address: 'G35QeFd4jpXWfRkuRKwn8g4vYrmn8DWJ5v88Kkpd8z1V' as Address,
                        role: AccountRole.READONLY_SIGNER,
                    },
                    {
                        address: 'H4RdPRWYk3pKw2CkNznxQK6J6herjgQke2pzFJW4GC6x' as Address,
                        role: AccountRole.WRITABLE_SIGNER,
                    },
                ],
                data: instructionData,
                programAddress: 'HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf' as Address,
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
                }).compileToV0Message(),
            );

            const transaction = fromVersionedTransactionWithBlockhash(oldTransaction);

            const expectedInstructions: IInstruction[] = [
                {
                    programAddress: 'Cmqw16pVQvmW1b7Ek1ioQ5Ggf1PaoXi5XxsK9iVSbRKC' as Address,
                },
                {
                    programAddress: '3hpECiFPtnyxoWqWqcVyfBUDhPKSZXWDduNXFywo8ncP' as Address,
                },
                {
                    programAddress: 'GJRYBLa6XpfswT1AN5tpGp8NHtUirwAdTPdSYXsW9L3S' as Address,
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
                }).compileToV0Message(),
            );

            const feePayerSignature = new Uint8Array(Array(64).fill(1));
            oldTransaction.addSignature(feePayerPublicKey, feePayerSignature);

            const transaction = fromVersionedTransactionWithBlockhash(
                oldTransaction,
            ) as unknown as ITransactionWithSignatures;

            expect(transaction.signatures).toStrictEqual({
                '7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK': feePayerSignature as SignatureBytes,
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
                }).compileToV0Message(),
            );

            const feePayerSignature = new Uint8Array(Array(64).fill(1));
            const otherSignature1 = new Uint8Array(Array(64).fill(2));
            const otherSignature2 = new Uint8Array(Array(64).fill(3));

            oldTransaction.addSignature(feePayerPublicKey, feePayerSignature);
            oldTransaction.addSignature(otherSigner1PublicKey, otherSignature1);
            oldTransaction.addSignature(otherSigner2PublicKey, otherSignature2);

            const transaction = fromVersionedTransactionWithBlockhash(
                oldTransaction,
            ) as unknown as ITransactionWithSignatures;

            expect(transaction.signatures).toStrictEqual({
                '3LeBzRE9Yna5zi9R8vdT3MiNQYuEp4gJgVyhhwmqfCtd': new Uint8Array(Array(64).fill(3)),
                '7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK': new Uint8Array(Array(64).fill(1)) as SignatureBytes,
                '8kud9bpNvfemXYdTFjs5cZ8fZinBkx8JAnhVmRwJZk5e': new Uint8Array(Array(64).fill(2)) as SignatureBytes,
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
                }).compileToV0Message(),
            );

            const feePayerSignature = new Uint8Array(Array(64).fill(1));
            const otherSignature2 = new Uint8Array(Array(64).fill(3));

            oldTransaction.addSignature(feePayerPublicKey, feePayerSignature);
            oldTransaction.addSignature(otherSigner2PublicKey, otherSignature2);

            const transaction = fromVersionedTransactionWithBlockhash(
                oldTransaction,
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
                }).compileToV0Message(),
            );

            const transaction = fromVersionedTransactionWithBlockhash(oldTransaction, 100n);

            expect(transaction.lifetimeConstraint).toEqual({
                blockhash: blockhashString,
                lastValidBlockHeight: 100n,
            });
        });
    });
});

describe('fromVersionedTransactionWithDurableNonce', () => {
    const nonce = '27kqzE1RifbyoFtibDRTjbnfZ894jsNpuR77JJkt3vgH' as Nonce;
    const nonceAccountAddress = new PublicKey('DhezFECsqmzuDxeuitFChbghTrwKLdsKdVsGArYbFEtm');
    const nonceAuthorityAddress = new PublicKey('2KntmCrnaf63tpNb8UMFFjFGGnYYAKQdmW9SbuCiRvhM');

    const feePayerPublicKey = new PublicKey('7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK');

    // /** An account's public key */
    // pubkey: PublicKey;
    // /** True if an instruction requires a transaction signature matching `pubkey` */
    // isSigner: boolean;
    // /** True if the `pubkey` can be loaded as a read-write account. */
    // isWritable: boolean;

    // A NonceAdvance instruction in old web3js TransactionInstruction form
    function createNonceAdvanceInstruction(): TransactionInstruction {
        return new TransactionInstruction({
            data: Buffer.from([4, 0, 0, 0]),
            keys: [
                { isSigner: false, isWritable: true, pubkey: nonceAccountAddress },
                {
                    isSigner: false,
                    isWritable: false,
                    pubkey: new PublicKey('SysvarRecentB1ockHashes11111111111111111111'),
                },
                { isSigner: true, isWritable: false, pubkey: nonceAuthorityAddress },
            ],
            programId: new PublicKey('11111111111111111111111111111111'),
        });
    }

    describe('for a transaction with `legacy` version', () => {
        it('throws for a transaction with no instructions', () => {
            const oldTransaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [],
                    payerKey: feePayerPublicKey,
                    recentBlockhash: nonce,
                }).compileToLegacyMessage(),
            );

            expect(() => {
                fromVersionedTransactionWithDurableNonce(oldTransaction);
            }).toThrow(new SolanaError(SOLANA_ERROR__TRANSACTION__INVALID_NONCE_TRANSACTION_INSTRUCTIONS_MISSING));
        });

        it('throws for a transaction with one instruction which is not advance nonce', () => {
            const programId = new PublicKey('HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf');

            const instruction = new TransactionInstruction({
                keys: [],
                programId,
            });

            const oldTransaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [instruction],
                    payerKey: feePayerPublicKey,
                    recentBlockhash: nonce,
                }).compileToLegacyMessage(),
            );

            expect(() => {
                fromVersionedTransactionWithDurableNonce(oldTransaction);
            }).toThrow(
                new SolanaError(
                    SOLANA_ERROR__TRANSACTION__INVALID_NONCE_TRANSACTION_FIRST_INSTRUCTION_MUST_BE_ADVANCE_NONCE,
                ),
            );
        });

        it('converts a transaction with one instruction which is advance nonce', () => {
            const nonceAdvanceInstruction = createNonceAdvanceInstruction();

            const oldTransaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [nonceAdvanceInstruction],
                    payerKey: feePayerPublicKey,
                    recentBlockhash: nonce,
                }).compileToLegacyMessage(),
            );

            const transaction = fromVersionedTransactionWithDurableNonce(oldTransaction);

            const expectedInstruction: IInstruction = {
                accounts: [
                    {
                        address: 'DhezFECsqmzuDxeuitFChbghTrwKLdsKdVsGArYbFEtm' as Address,
                        role: AccountRole.WRITABLE,
                    },
                    {
                        address: 'SysvarRecentB1ockHashes11111111111111111111' as Address,
                        role: AccountRole.READONLY,
                    },
                    {
                        address: '2KntmCrnaf63tpNb8UMFFjFGGnYYAKQdmW9SbuCiRvhM' as Address,
                        role: AccountRole.READONLY_SIGNER,
                    },
                ],
                data: new Uint8Array([4, 0, 0, 0]),
                programAddress: '11111111111111111111111111111111' as Address,
            };

            expect(transaction.instructions).toStrictEqual([expectedInstruction]);
        });

        it('converts a durable nonce transaction with multiple instructions', () => {
            const nonceAdvanceInstruction = createNonceAdvanceInstruction();

            const instructions = [
                nonceAdvanceInstruction,
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
                    recentBlockhash: nonce,
                }).compileToLegacyMessage(),
            );

            const transaction = fromVersionedTransactionWithDurableNonce(oldTransaction);

            const expectedInstructions: IInstruction[] = [
                {
                    accounts: [
                        {
                            address: 'DhezFECsqmzuDxeuitFChbghTrwKLdsKdVsGArYbFEtm' as Address,
                            role: AccountRole.WRITABLE,
                        },
                        {
                            address: 'SysvarRecentB1ockHashes11111111111111111111' as Address,
                            role: AccountRole.READONLY,
                        },
                        {
                            address: '2KntmCrnaf63tpNb8UMFFjFGGnYYAKQdmW9SbuCiRvhM' as Address,
                            role: AccountRole.READONLY_SIGNER,
                        },
                    ],
                    data: new Uint8Array([4, 0, 0, 0]),
                    programAddress: '11111111111111111111111111111111' as Address,
                },
                {
                    programAddress: 'Cmqw16pVQvmW1b7Ek1ioQ5Ggf1PaoXi5XxsK9iVSbRKC' as Address,
                },
                {
                    programAddress: '3hpECiFPtnyxoWqWqcVyfBUDhPKSZXWDduNXFywo8ncP' as Address,
                },
                {
                    programAddress: 'GJRYBLa6XpfswT1AN5tpGp8NHtUirwAdTPdSYXsW9L3S' as Address,
                },
            ];

            expect(transaction.instructions).toStrictEqual(expectedInstructions);
        });

        it('converts a durable nonce transaction with a single signer', () => {
            const nonceAdvanceInstruction = createNonceAdvanceInstruction();

            const oldTransaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [nonceAdvanceInstruction],
                    // Note there's a bug in legacy web3js where if the feepayer
                    // is the same as authorizedPubkey, it gets the wrong role
                    // in the advance nonce instruction
                    // So for our test just use a different account as fee payer
                    payerKey: feePayerPublicKey,
                    recentBlockhash: nonce,
                }).compileToLegacyMessage(),
            );

            const signature = new Uint8Array(Array(64).fill(1));
            oldTransaction.addSignature(nonceAuthorityAddress, signature);

            const transaction = fromVersionedTransactionWithDurableNonce(
                oldTransaction,
            ) as unknown as ITransactionWithSignatures;

            expect(transaction.signatures).toStrictEqual({
                '2KntmCrnaf63tpNb8UMFFjFGGnYYAKQdmW9SbuCiRvhM': signature as SignatureBytes,
            });
        });

        it('converts a durable nonce transaction with multiple signers', () => {
            const nonceAdvanceInstruction = createNonceAdvanceInstruction();

            const oldTransaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [nonceAdvanceInstruction],
                    payerKey: feePayerPublicKey,
                    recentBlockhash: nonce,
                }).compileToLegacyMessage(),
            );

            const feePayerSignature = new Uint8Array(Array(64).fill(1));
            oldTransaction.addSignature(feePayerPublicKey, feePayerSignature);

            const nonceAuthoritySignature = new Uint8Array(Array(64).fill(2));
            oldTransaction.addSignature(nonceAuthorityAddress, nonceAuthoritySignature);

            const transaction = fromVersionedTransactionWithDurableNonce(
                oldTransaction,
            ) as unknown as ITransactionWithSignatures;

            expect(transaction.signatures).toStrictEqual({
                '2KntmCrnaf63tpNb8UMFFjFGGnYYAKQdmW9SbuCiRvhM': nonceAuthoritySignature as SignatureBytes,
                '7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK': feePayerSignature as SignatureBytes,
            });
        });

        it('converts a partially signed durable nonce transaction with multiple signers', () => {
            const nonceAdvanceInstruction = createNonceAdvanceInstruction();

            const otherSigner1PublicKey = new PublicKey('BHPhpD7z7LqwDj2SFSWHoVWitXc9ycrgsftbAE1wpazj');

            const accountMetasSigners = [
                {
                    isSigner: true,
                    isWritable: false,
                    pubkey: otherSigner1PublicKey,
                },
            ];

            const oldTransaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [
                        nonceAdvanceInstruction,
                        new TransactionInstruction({
                            keys: accountMetasSigners,
                            programId: new PublicKey('HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf'),
                        }),
                    ],
                    payerKey: feePayerPublicKey,
                    recentBlockhash: nonce,
                }).compileToLegacyMessage(),
            );

            const feePayerSignature = new Uint8Array(Array(64).fill(1));
            // No signature for nonceAuthorityAddress
            const otherSignature1 = new Uint8Array(Array(64).fill(3));

            oldTransaction.addSignature(feePayerPublicKey, feePayerSignature);
            oldTransaction.addSignature(otherSigner1PublicKey, otherSignature1);

            const transaction = fromVersionedTransactionWithDurableNonce(
                oldTransaction,
            ) as unknown as ITransactionWithSignatures;

            expect(transaction.signatures).toStrictEqual({
                '7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK': new Uint8Array(Array(64).fill(1)),
                BHPhpD7z7LqwDj2SFSWHoVWitXc9ycrgsftbAE1wpazj: new Uint8Array(Array(64).fill(3)),
            });
        });
    });

    describe('for a transaction with `0` version', () => {
        it('throws for a transaction with no instructions', () => {
            const oldTransaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [],
                    payerKey: feePayerPublicKey,
                    recentBlockhash: nonce,
                }).compileToV0Message(),
            );

            expect(() => {
                fromVersionedTransactionWithDurableNonce(oldTransaction);
            }).toThrow(new SolanaError(SOLANA_ERROR__TRANSACTION__INVALID_NONCE_TRANSACTION_INSTRUCTIONS_MISSING));
        });

        it('throws for a transaction with one instruction which is not advance nonce', () => {
            const programId = new PublicKey('HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf');

            const instruction = new TransactionInstruction({
                keys: [],
                programId,
            });

            const oldTransaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [instruction],
                    payerKey: feePayerPublicKey,
                    recentBlockhash: nonce,
                }).compileToV0Message(),
            );

            expect(() => {
                fromVersionedTransactionWithDurableNonce(oldTransaction);
            }).toThrow(
                new SolanaError(
                    SOLANA_ERROR__TRANSACTION__INVALID_NONCE_TRANSACTION_FIRST_INSTRUCTION_MUST_BE_ADVANCE_NONCE,
                ),
            );
        });

        it('converts a transaction with one instruction which is advance nonce', () => {
            const nonceAdvanceInstruction = createNonceAdvanceInstruction();

            const oldTransaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [nonceAdvanceInstruction],
                    payerKey: feePayerPublicKey,
                    recentBlockhash: nonce,
                }).compileToV0Message(),
            );

            const transaction = fromVersionedTransactionWithDurableNonce(oldTransaction);

            const expectedInstruction: IInstruction = {
                accounts: [
                    {
                        address: 'DhezFECsqmzuDxeuitFChbghTrwKLdsKdVsGArYbFEtm' as Address,
                        role: AccountRole.WRITABLE,
                    },
                    {
                        address: 'SysvarRecentB1ockHashes11111111111111111111' as Address,
                        role: AccountRole.READONLY,
                    },
                    {
                        address: '2KntmCrnaf63tpNb8UMFFjFGGnYYAKQdmW9SbuCiRvhM' as Address,
                        role: AccountRole.READONLY_SIGNER,
                    },
                ],
                data: new Uint8Array([4, 0, 0, 0]),
                programAddress: '11111111111111111111111111111111' as Address,
            };

            expect(transaction.instructions).toStrictEqual([expectedInstruction]);
        });

        it('converts a durable nonce transaction with multiple instructions', () => {
            const nonceAdvanceInstruction = createNonceAdvanceInstruction();

            const instructions = [
                nonceAdvanceInstruction,
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
                    recentBlockhash: nonce,
                }).compileToV0Message(),
            );

            const transaction = fromVersionedTransactionWithDurableNonce(oldTransaction);

            const expectedInstructions: IInstruction[] = [
                {
                    accounts: [
                        {
                            address: 'DhezFECsqmzuDxeuitFChbghTrwKLdsKdVsGArYbFEtm' as Address,
                            role: AccountRole.WRITABLE,
                        },
                        {
                            address: 'SysvarRecentB1ockHashes11111111111111111111' as Address,
                            role: AccountRole.READONLY,
                        },
                        {
                            address: '2KntmCrnaf63tpNb8UMFFjFGGnYYAKQdmW9SbuCiRvhM' as Address,
                            role: AccountRole.READONLY_SIGNER,
                        },
                    ],
                    data: new Uint8Array([4, 0, 0, 0]),
                    programAddress: '11111111111111111111111111111111' as Address,
                },
                {
                    programAddress: 'Cmqw16pVQvmW1b7Ek1ioQ5Ggf1PaoXi5XxsK9iVSbRKC' as Address,
                },
                {
                    programAddress: '3hpECiFPtnyxoWqWqcVyfBUDhPKSZXWDduNXFywo8ncP' as Address,
                },
                {
                    programAddress: 'GJRYBLa6XpfswT1AN5tpGp8NHtUirwAdTPdSYXsW9L3S' as Address,
                },
            ];

            expect(transaction.instructions).toStrictEqual(expectedInstructions);
        });

        it('converts a durable nonce transaction with a single signer', () => {
            const nonceAdvanceInstruction = createNonceAdvanceInstruction();

            const oldTransaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [nonceAdvanceInstruction],
                    // Note there's a bug in legacy web3js where if the feepayer
                    // is the same as authorizedPubkey, it gets the wrong role
                    // in the advance nonce instruction
                    // So for our test just use a different account as fee payer
                    payerKey: feePayerPublicKey,
                    recentBlockhash: nonce,
                }).compileToV0Message(),
            );

            const signature = new Uint8Array(Array(64).fill(1));
            oldTransaction.addSignature(nonceAuthorityAddress, signature);

            const transaction = fromVersionedTransactionWithDurableNonce(
                oldTransaction,
            ) as unknown as ITransactionWithSignatures;

            expect(transaction.signatures).toStrictEqual({
                '2KntmCrnaf63tpNb8UMFFjFGGnYYAKQdmW9SbuCiRvhM': signature as SignatureBytes,
            });
        });

        it('converts a durable nonce transaction with multiple signers', () => {
            const nonceAdvanceInstruction = createNonceAdvanceInstruction();

            const oldTransaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [nonceAdvanceInstruction],
                    payerKey: feePayerPublicKey,
                    recentBlockhash: nonce,
                }).compileToV0Message(),
            );

            const feePayerSignature = new Uint8Array(Array(64).fill(1));
            oldTransaction.addSignature(feePayerPublicKey, feePayerSignature);

            const nonceAuthoritySignature = new Uint8Array(Array(64).fill(2));
            oldTransaction.addSignature(nonceAuthorityAddress, nonceAuthoritySignature);

            const transaction = fromVersionedTransactionWithDurableNonce(
                oldTransaction,
            ) as unknown as ITransactionWithSignatures;

            expect(transaction.signatures).toStrictEqual({
                '2KntmCrnaf63tpNb8UMFFjFGGnYYAKQdmW9SbuCiRvhM': nonceAuthoritySignature as SignatureBytes,
                '7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK': feePayerSignature as SignatureBytes,
            });
        });

        it('converts a partially signed durable nonce transaction with multiple signers', () => {
            const nonceAdvanceInstruction = createNonceAdvanceInstruction();

            const otherSigner1PublicKey = new PublicKey('BHPhpD7z7LqwDj2SFSWHoVWitXc9ycrgsftbAE1wpazj');

            const accountMetasSigners = [
                {
                    isSigner: true,
                    isWritable: false,
                    pubkey: otherSigner1PublicKey,
                },
            ];

            const oldTransaction = new VersionedTransaction(
                new TransactionMessage({
                    instructions: [
                        nonceAdvanceInstruction,
                        new TransactionInstruction({
                            keys: accountMetasSigners,
                            programId: new PublicKey('HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf'),
                        }),
                    ],
                    payerKey: feePayerPublicKey,
                    recentBlockhash: nonce,
                }).compileToV0Message(),
            );

            const feePayerSignature = new Uint8Array(Array(64).fill(1));
            // No signature for nonceAuthorityAddress
            const otherSignature1 = new Uint8Array(Array(64).fill(3));

            oldTransaction.addSignature(feePayerPublicKey, feePayerSignature);
            oldTransaction.addSignature(otherSigner1PublicKey, otherSignature1);

            const transaction = fromVersionedTransactionWithDurableNonce(
                oldTransaction,
            ) as unknown as ITransactionWithSignatures;

            expect(transaction.signatures).toStrictEqual({
                '7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK': new Uint8Array(Array(64).fill(1)),
                BHPhpD7z7LqwDj2SFSWHoVWitXc9ycrgsftbAE1wpazj: new Uint8Array(Array(64).fill(3)),
            });
        });
    });
});
