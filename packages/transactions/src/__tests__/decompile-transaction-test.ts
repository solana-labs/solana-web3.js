import { Base58EncodedAddress } from '@solana/addresses';
import { AccountRole, IInstruction } from '@solana/instructions';
import { Ed25519Signature } from '@solana/keys';

import { ITransactionWithSignatures } from '..';
import { decompileTransaction } from '../decompile-transaction';
import { CompiledMessage } from '../message';

type CompiledTransaction = Readonly<{
    compiledMessage: CompiledMessage;
    signatures: Ed25519Signature[];
}>;

describe('decompileTransaction', () => {
    const U64_MAX = 2n ** 64n - 1n;
    const feePayer = '7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK' as Base58EncodedAddress;

    describe('for a blockhash lifetime', () => {
        const blockhash = 'J4yED2jcMAHyQUg61DBmm4njmEydUr2WqrV9cdEcDDgL';

        it('converts a transaction with no instructions', () => {
            const compiledTransaction: CompiledTransaction = {
                compiledMessage: {
                    header: {
                        numReadonlyNonSignerAccounts: 0,
                        numReadonlySignerAccounts: 0,
                        numSignerAccounts: 1,
                    },
                    instructions: [],
                    lifetimeToken: blockhash,
                    staticAccounts: [feePayer],
                    version: 0,
                },
                signatures: [],
            };

            const transaction = decompileTransaction(compiledTransaction);

            expect(transaction.version).toBe(0);
            expect(transaction.feePayer).toEqual(feePayer);
            expect(transaction.lifetimeConstraint).toEqual({
                blockhash,
                lastValidBlockHeight: U64_MAX,
            });
        });

        it('converts a transaction with version legacy', () => {
            const compiledTransaction: CompiledTransaction = {
                compiledMessage: {
                    header: {
                        numReadonlyNonSignerAccounts: 0,
                        numReadonlySignerAccounts: 0,
                        numSignerAccounts: 1,
                    },
                    instructions: [],
                    lifetimeToken: blockhash,
                    staticAccounts: [feePayer],
                    version: 'legacy',
                },
                signatures: [],
            };

            const transaction = decompileTransaction(compiledTransaction);
            expect(transaction.version).toBe('legacy');
        });

        it('converts a transaction with one instruction with no accounts or data', () => {
            const programAddress = 'HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf' as Base58EncodedAddress;

            const compiledTransaction: CompiledTransaction = {
                compiledMessage: {
                    header: {
                        numReadonlyNonSignerAccounts: 1,
                        // fee payer
                        numReadonlySignerAccounts: 0,
                        numSignerAccounts: 1, // program address
                    },
                    instructions: [{ programAddressIndex: 1 }],
                    lifetimeToken: blockhash,
                    staticAccounts: [feePayer, programAddress],
                    version: 0,
                },
                signatures: [],
            };

            const transaction = decompileTransaction(compiledTransaction);
            const expectedInstruction: IInstruction = {
                programAddress,
            };
            expect(transaction.instructions).toStrictEqual([expectedInstruction]);
        });

        it('converts a transaction with one instruction with accounts and data', () => {
            const programAddress = 'HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf' as Base58EncodedAddress;

            const compiledTransaction: CompiledTransaction = {
                compiledMessage: {
                    header: {
                        numReadonlyNonSignerAccounts: 2, // 1 passed into instruction + 1 program
                        numReadonlySignerAccounts: 1,
                        numSignerAccounts: 3, // fee payer + 2 passed into instruction
                    },
                    instructions: [
                        {
                            accountIndices: [1, 2, 3, 4],
                            data: new Uint8Array([0, 1, 2, 3, 4]),
                            programAddressIndex: 5,
                        },
                    ],
                    lifetimeToken: blockhash,
                    staticAccounts: [
                        // writable signers
                        feePayer,
                        'H4RdPRWYk3pKw2CkNznxQK6J6herjgQke2pzFJW4GC6x' as Base58EncodedAddress,
                        // read-only signers
                        'G35QeFd4jpXWfRkuRKwn8g4vYrmn8DWJ5v88Kkpd8z1V' as Base58EncodedAddress,
                        // writable non-signers
                        '3LeBzRE9Yna5zi9R8vdT3MiNQYuEp4gJgVyhhwmqfCtd' as Base58EncodedAddress,
                        // read-only non-signers
                        '8kud9bpNvfemXYdTFjs5cZ8fZinBkx8JAnhVmRwJZk5e' as Base58EncodedAddress,
                        programAddress,
                    ],
                    version: 0,
                },
                signatures: [],
            };

            const transaction = decompileTransaction(compiledTransaction);

            const expectedInstruction: IInstruction = {
                accounts: [
                    {
                        address: 'H4RdPRWYk3pKw2CkNznxQK6J6herjgQke2pzFJW4GC6x' as Base58EncodedAddress,
                        role: AccountRole.WRITABLE_SIGNER,
                    },
                    {
                        address: 'G35QeFd4jpXWfRkuRKwn8g4vYrmn8DWJ5v88Kkpd8z1V' as Base58EncodedAddress,
                        role: AccountRole.READONLY_SIGNER,
                    },
                    {
                        address: '3LeBzRE9Yna5zi9R8vdT3MiNQYuEp4gJgVyhhwmqfCtd' as Base58EncodedAddress,
                        role: AccountRole.WRITABLE,
                    },
                    {
                        address: '8kud9bpNvfemXYdTFjs5cZ8fZinBkx8JAnhVmRwJZk5e' as Base58EncodedAddress,
                        role: AccountRole.READONLY,
                    },
                ],
                data: new Uint8Array([0, 1, 2, 3, 4]),
                programAddress,
            };

            expect(transaction.instructions).toStrictEqual([expectedInstruction]);
        });

        it('converts a transaction with multiple instructions', () => {
            const compiledTransaction: CompiledTransaction = {
                compiledMessage: {
                    header: {
                        numReadonlyNonSignerAccounts: 3, // 3 programs
                        numReadonlySignerAccounts: 0,
                        numSignerAccounts: 1, // fee payer
                    },
                    instructions: [{ programAddressIndex: 1 }, { programAddressIndex: 2 }, { programAddressIndex: 3 }],
                    lifetimeToken: blockhash,
                    staticAccounts: [
                        feePayer,
                        '3hpECiFPtnyxoWqWqcVyfBUDhPKSZXWDduNXFywo8ncP' as Base58EncodedAddress,
                        'Cmqw16pVQvmW1b7Ek1ioQ5Ggf1PaoXi5XxsK9iVSbRKC' as Base58EncodedAddress,
                        'GJRYBLa6XpfswT1AN5tpGp8NHtUirwAdTPdSYXsW9L3S' as Base58EncodedAddress,
                    ],
                    version: 0,
                },
                signatures: [],
            };

            const transaction = decompileTransaction(compiledTransaction);

            const expectedInstructions: IInstruction[] = [
                {
                    programAddress: '3hpECiFPtnyxoWqWqcVyfBUDhPKSZXWDduNXFywo8ncP' as Base58EncodedAddress,
                },
                {
                    programAddress: 'Cmqw16pVQvmW1b7Ek1ioQ5Ggf1PaoXi5XxsK9iVSbRKC' as Base58EncodedAddress,
                },
                {
                    programAddress: 'GJRYBLa6XpfswT1AN5tpGp8NHtUirwAdTPdSYXsW9L3S' as Base58EncodedAddress,
                },
            ];

            expect(transaction.instructions).toStrictEqual(expectedInstructions);
        });

        it('converts a transaction with a single signer', () => {
            const feePayerSignature = new Uint8Array(Array(64).fill(1)) as Ed25519Signature;

            const compiledTransaction: CompiledTransaction = {
                compiledMessage: {
                    header: {
                        numReadonlyNonSignerAccounts: 0,
                        numReadonlySignerAccounts: 0,
                        numSignerAccounts: 1,
                    },
                    instructions: [],
                    lifetimeToken: blockhash,
                    staticAccounts: [feePayer],
                    version: 0,
                },
                signatures: [feePayerSignature],
            };

            const transaction = decompileTransaction(compiledTransaction) as ITransactionWithSignatures;
            expect(transaction.signatures).toStrictEqual({
                [feePayer]: feePayerSignature as Ed25519Signature,
            });
        });

        it('converts a transaction with multiple signers', () => {
            const feePayerSignature = new Uint8Array(Array(64).fill(1)) as Ed25519Signature;

            const otherSigner1Address = '3LeBzRE9Yna5zi9R8vdT3MiNQYuEp4gJgVyhhwmqfCtd' as Base58EncodedAddress;
            const otherSigner1Signature = new Uint8Array(Array(64).fill(2)) as Ed25519Signature;

            const otherSigner2Address = '8kud9bpNvfemXYdTFjs5cZ8fZinBkx8JAnhVmRwJZk5e' as Base58EncodedAddress;
            const otherSigner2Signature = new Uint8Array(Array(64).fill(3)) as Ed25519Signature;

            const programAddress = 'HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf' as Base58EncodedAddress;

            const compiledTransaction: CompiledTransaction = {
                compiledMessage: {
                    header: {
                        numReadonlyNonSignerAccounts: 1,
                        numReadonlySignerAccounts: 2,
                        numSignerAccounts: 3,
                    },
                    instructions: [
                        {
                            accountIndices: [1, 2],
                            programAddressIndex: 3,
                        },
                    ],
                    lifetimeToken: blockhash,
                    staticAccounts: [feePayer, otherSigner1Address, otherSigner2Address, programAddress],
                    version: 0,
                },
                signatures: [feePayerSignature, otherSigner1Signature, otherSigner2Signature],
            };

            const transaction = decompileTransaction(compiledTransaction) as ITransactionWithSignatures;
            expect(transaction.signatures).toStrictEqual({
                [feePayer]: feePayerSignature,
                [otherSigner1Address]: otherSigner1Signature,
                [otherSigner2Address]: otherSigner2Signature,
            });
        });

        it('converts a partially signed transaction with multiple signers', () => {
            const feePayerSignature = new Uint8Array(Array(64).fill(1)) as Ed25519Signature;

            const otherSigner1Address = '3LeBzRE9Yna5zi9R8vdT3MiNQYuEp4gJgVyhhwmqfCtd' as Base58EncodedAddress;
            const otherSigner2Address = '8kud9bpNvfemXYdTFjs5cZ8fZinBkx8JAnhVmRwJZk5e' as Base58EncodedAddress;
            const otherSigner2Signature = new Uint8Array(Array(64).fill(3)) as Ed25519Signature;

            const programAddress = 'HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf' as Base58EncodedAddress;

            // Used in the signatures array for a missing signature
            const noSignature = new Uint8Array(Array(64).fill(0)) as Ed25519Signature;

            const compiledTransaction: CompiledTransaction = {
                compiledMessage: {
                    header: {
                        numReadonlyNonSignerAccounts: 1,
                        numReadonlySignerAccounts: 2,
                        numSignerAccounts: 3,
                    },
                    instructions: [
                        {
                            accountIndices: [1, 2],
                            programAddressIndex: 3,
                        },
                    ],
                    lifetimeToken: blockhash,
                    staticAccounts: [feePayer, otherSigner1Address, otherSigner2Address, programAddress],
                    version: 0,
                },
                signatures: [feePayerSignature, noSignature, otherSigner2Signature],
            };

            const transaction = decompileTransaction(compiledTransaction) as ITransactionWithSignatures;
            expect(transaction.signatures).toStrictEqual({
                [feePayer]: feePayerSignature,
                [otherSigner2Address]: otherSigner2Signature,
            });
        });

        it('converts a transaction with a given lastValidBlockHeight', () => {
            const compiledTransaction: CompiledTransaction = {
                compiledMessage: {
                    header: {
                        numReadonlyNonSignerAccounts: 0,
                        numReadonlySignerAccounts: 0,
                        numSignerAccounts: 1,
                    },
                    instructions: [],
                    lifetimeToken: blockhash,
                    staticAccounts: [feePayer],
                    version: 0,
                },
                signatures: [],
            };

            const transaction = decompileTransaction(compiledTransaction, 100n);
            expect(transaction.lifetimeConstraint).toEqual({
                blockhash,
                lastValidBlockHeight: 100n,
            });
        });
    });
});
