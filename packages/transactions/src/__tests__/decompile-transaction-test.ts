import { Address } from '@solana/addresses';
import { AccountRole, IInstruction } from '@solana/instructions';
import { SignatureBytes } from '@solana/keys';

import { decompileTransaction } from '../decompile-transaction';
import { Nonce } from '../durable-nonce';
import { CompiledMessage } from '../message';
import { ITransactionWithSignatures } from '../signatures';

type CompiledTransaction = Readonly<{
    compiledMessage: CompiledMessage;
    signatures: SignatureBytes[];
}>;

describe('decompileTransaction', () => {
    const U64_MAX = 2n ** 64n - 1n;
    const feePayer = '7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK' as Address;

    describe('for a transaction with a blockhash lifetime', () => {
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
            const programAddress = 'HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf' as Address;

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
            const programAddress = 'HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf' as Address;

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
                        'H4RdPRWYk3pKw2CkNznxQK6J6herjgQke2pzFJW4GC6x' as Address,
                        // read-only signers
                        'G35QeFd4jpXWfRkuRKwn8g4vYrmn8DWJ5v88Kkpd8z1V' as Address,
                        // writable non-signers
                        '3LeBzRE9Yna5zi9R8vdT3MiNQYuEp4gJgVyhhwmqfCtd' as Address,
                        // read-only non-signers
                        '8kud9bpNvfemXYdTFjs5cZ8fZinBkx8JAnhVmRwJZk5e' as Address,
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
                        address: 'H4RdPRWYk3pKw2CkNznxQK6J6herjgQke2pzFJW4GC6x' as Address,
                        role: AccountRole.WRITABLE_SIGNER,
                    },
                    {
                        address: 'G35QeFd4jpXWfRkuRKwn8g4vYrmn8DWJ5v88Kkpd8z1V' as Address,
                        role: AccountRole.READONLY_SIGNER,
                    },
                    {
                        address: '3LeBzRE9Yna5zi9R8vdT3MiNQYuEp4gJgVyhhwmqfCtd' as Address,
                        role: AccountRole.WRITABLE,
                    },
                    {
                        address: '8kud9bpNvfemXYdTFjs5cZ8fZinBkx8JAnhVmRwJZk5e' as Address,
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
                        '3hpECiFPtnyxoWqWqcVyfBUDhPKSZXWDduNXFywo8ncP' as Address,
                        'Cmqw16pVQvmW1b7Ek1ioQ5Ggf1PaoXi5XxsK9iVSbRKC' as Address,
                        'GJRYBLa6XpfswT1AN5tpGp8NHtUirwAdTPdSYXsW9L3S' as Address,
                    ],
                    version: 0,
                },
                signatures: [],
            };

            const transaction = decompileTransaction(compiledTransaction);

            const expectedInstructions: IInstruction[] = [
                {
                    programAddress: '3hpECiFPtnyxoWqWqcVyfBUDhPKSZXWDduNXFywo8ncP' as Address,
                },
                {
                    programAddress: 'Cmqw16pVQvmW1b7Ek1ioQ5Ggf1PaoXi5XxsK9iVSbRKC' as Address,
                },
                {
                    programAddress: 'GJRYBLa6XpfswT1AN5tpGp8NHtUirwAdTPdSYXsW9L3S' as Address,
                },
            ];

            expect(transaction.instructions).toStrictEqual(expectedInstructions);
        });

        it('converts a transaction with a single signer', () => {
            const feePayerSignature = new Uint8Array(Array(64).fill(1)) as SignatureBytes;

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
                [feePayer]: feePayerSignature as SignatureBytes,
            });
        });

        it('converts a transaction with multiple signers', () => {
            const feePayerSignature = new Uint8Array(Array(64).fill(1)) as SignatureBytes;

            const otherSigner1Address = '3LeBzRE9Yna5zi9R8vdT3MiNQYuEp4gJgVyhhwmqfCtd' as Address;
            const otherSigner1Signature = new Uint8Array(Array(64).fill(2)) as SignatureBytes;

            const otherSigner2Address = '8kud9bpNvfemXYdTFjs5cZ8fZinBkx8JAnhVmRwJZk5e' as Address;
            const otherSigner2Signature = new Uint8Array(Array(64).fill(3)) as SignatureBytes;

            const programAddress = 'HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf' as Address;

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
            const feePayerSignature = new Uint8Array(Array(64).fill(1)) as SignatureBytes;

            const otherSigner1Address = '3LeBzRE9Yna5zi9R8vdT3MiNQYuEp4gJgVyhhwmqfCtd' as Address;
            const otherSigner2Address = '8kud9bpNvfemXYdTFjs5cZ8fZinBkx8JAnhVmRwJZk5e' as Address;
            const otherSigner2Signature = new Uint8Array(Array(64).fill(3)) as SignatureBytes;

            const programAddress = 'HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf' as Address;

            // Used in the signatures array for a missing signature
            const noSignature = new Uint8Array(Array(64).fill(0)) as SignatureBytes;

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

    describe('for a transaction with a durable nonce lifetime', () => {
        const nonce = '27kqzE1RifbyoFtibDRTjbnfZ894jsNpuR77JJkt3vgH' as Nonce;

        // added as writable non-signer in the durable nonce instruction
        const nonceAccountAddress = 'DhezFECsqmzuDxeuitFChbghTrwKLdsKdVsGArYbFEtm' as Address;

        // added as read-only signer in the durable nonce instruction
        const nonceAuthorityAddress = '2KntmCrnaf63tpNb8UMFFjFGGnYYAKQdmW9SbuCiRvhM' as Address;

        const systemProgramAddress = '11111111111111111111111111111111' as Address;
        const recentBlockhashesSysvarAddress = 'SysvarRecentB1ockHashes11111111111111111111' as Address;

        it('converts a transaction with one instruction which is advance nonce (fee payer is nonce authority)', () => {
            const compiledTransaction: CompiledTransaction = {
                compiledMessage: {
                    header: {
                        numReadonlyNonSignerAccounts: 2, // recent blockhashes sysvar, system program
                        numReadonlySignerAccounts: 0, // nonce authority already added as fee payer
                        numSignerAccounts: 1, // fee payer and nonce authority are the same account
                    },
                    instructions: [
                        {
                            accountIndices: [
                                1, // nonce account address
                                3, // recent blockhashes sysvar
                                0, // nonce authority address
                            ],
                            data: new Uint8Array([4, 0, 0, 0]),
                            programAddressIndex: 2,
                        },
                    ],
                    lifetimeToken: nonce,
                    staticAccounts: [
                        // writable signers
                        nonceAuthorityAddress,
                        // no read-only signers
                        // writable non-signers
                        nonceAccountAddress,
                        // read-only non-signers
                        systemProgramAddress,
                        recentBlockhashesSysvarAddress,
                    ],
                    version: 0,
                },
                signatures: [],
            };

            const transaction = decompileTransaction(compiledTransaction);

            const expectedInstruction: IInstruction = {
                accounts: [
                    {
                        address: nonceAccountAddress,
                        role: AccountRole.WRITABLE,
                    },
                    {
                        address: recentBlockhashesSysvarAddress,
                        role: AccountRole.READONLY,
                    },
                    {
                        address: nonceAuthorityAddress,
                        role: AccountRole.WRITABLE_SIGNER,
                    },
                ],
                data: new Uint8Array([4, 0, 0, 0]),
                programAddress: systemProgramAddress,
            };

            expect(transaction.instructions).toStrictEqual([expectedInstruction]);
            expect(transaction.feePayer).toStrictEqual(nonceAuthorityAddress);
            expect(transaction.lifetimeConstraint).toStrictEqual({ nonce });
        });

        it('converts a transaction with one instruction which is advance nonce (fee payer is not nonce authority)', () => {
            const compiledTransaction: CompiledTransaction = {
                compiledMessage: {
                    header: {
                        numReadonlyNonSignerAccounts: 2, // recent blockhashes sysvar, system program
                        numReadonlySignerAccounts: 1, // nonce authority
                        numSignerAccounts: 2, // fee payer, nonce authority
                    },
                    instructions: [
                        {
                            accountIndices: [
                                2, // nonce account address
                                4, // recent blockhashes sysvar
                                1, // nonce authority address
                            ],
                            data: new Uint8Array([4, 0, 0, 0]),
                            programAddressIndex: 3,
                        },
                    ],
                    lifetimeToken: nonce,
                    staticAccounts: [
                        // writable signers
                        feePayer,
                        // read-only signers
                        nonceAuthorityAddress,
                        // writable non-signers
                        nonceAccountAddress,
                        // read-only non-signers
                        systemProgramAddress,
                        recentBlockhashesSysvarAddress,
                    ],
                    version: 0,
                },
                signatures: [],
            };

            const transaction = decompileTransaction(compiledTransaction);

            const expectedInstruction: IInstruction = {
                accounts: [
                    {
                        address: nonceAccountAddress,
                        role: AccountRole.WRITABLE,
                    },
                    {
                        address: recentBlockhashesSysvarAddress,
                        role: AccountRole.READONLY,
                    },
                    {
                        address: nonceAuthorityAddress,
                        role: AccountRole.READONLY_SIGNER,
                    },
                ],
                data: new Uint8Array([4, 0, 0, 0]),
                programAddress: systemProgramAddress,
            };
            expect(transaction.instructions).toStrictEqual([expectedInstruction]);
        });

        it('converts a durable nonce transaction with multiple instruction', () => {
            const compiledTransaction: CompiledTransaction = {
                compiledMessage: {
                    header: {
                        numReadonlyNonSignerAccounts: 4, // recent blockhashes sysvar, system program, 2 other program addresses
                        numReadonlySignerAccounts: 0, // nonce authority already added as fee payer
                        numSignerAccounts: 1, // fee payer and nonce authority are the same account
                    },
                    instructions: [
                        {
                            accountIndices: [
                                1, // nonce account address
                                3, // recent blockhashes sysvar
                                0, // nonce authority address
                            ],
                            data: new Uint8Array([4, 0, 0, 0]),
                            programAddressIndex: 2,
                        },
                        {
                            accountIndices: [0, 1],
                            data: new Uint8Array([1, 2, 3, 4]),
                            programAddressIndex: 4,
                        },
                        { programAddressIndex: 5 },
                    ],
                    lifetimeToken: nonce,
                    staticAccounts: [
                        // writable signers
                        nonceAuthorityAddress,
                        // no read-only signers
                        // writable non-signers
                        nonceAccountAddress,
                        // read-only non-signers
                        systemProgramAddress,
                        recentBlockhashesSysvarAddress,
                        '3hpECiFPtnyxoWqWqcVyfBUDhPKSZXWDduNXFywo8ncP' as Address,
                        'Cmqw16pVQvmW1b7Ek1ioQ5Ggf1PaoXi5XxsK9iVSbRKC' as Address,
                    ],
                    version: 0,
                },
                signatures: [],
            };

            const transaction = decompileTransaction(compiledTransaction);

            const expectedInstructions: IInstruction[] = [
                {
                    accounts: [
                        {
                            address: nonceAccountAddress,
                            role: AccountRole.WRITABLE,
                        },
                        {
                            address: recentBlockhashesSysvarAddress,
                            role: AccountRole.READONLY,
                        },
                        {
                            address: nonceAuthorityAddress,
                            role: AccountRole.WRITABLE_SIGNER,
                        },
                    ],
                    data: new Uint8Array([4, 0, 0, 0]),
                    programAddress: systemProgramAddress,
                },
                {
                    accounts: [
                        {
                            address: nonceAuthorityAddress,
                            role: AccountRole.WRITABLE_SIGNER,
                        },
                        {
                            address: nonceAccountAddress,
                            role: AccountRole.WRITABLE,
                        },
                    ],
                    data: new Uint8Array([1, 2, 3, 4]),
                    programAddress: '3hpECiFPtnyxoWqWqcVyfBUDhPKSZXWDduNXFywo8ncP' as Address,
                },
                {
                    programAddress: 'Cmqw16pVQvmW1b7Ek1ioQ5Ggf1PaoXi5XxsK9iVSbRKC' as Address,
                },
            ];

            expect(transaction.instructions).toStrictEqual(expectedInstructions);
            expect(transaction.lifetimeConstraint).toStrictEqual({ nonce });
        });

        it('converts a durable nonce transaction with a single signer', () => {
            const feePayerSignature = new Uint8Array(Array(64).fill(1)) as SignatureBytes;

            const compiledTransaction: CompiledTransaction = {
                compiledMessage: {
                    header: {
                        numReadonlyNonSignerAccounts: 2, // recent blockhashes sysvar, system program
                        numReadonlySignerAccounts: 0, // nonce authority already added as fee payer
                        numSignerAccounts: 1, // fee payer and nonce authority are the same account
                    },
                    instructions: [
                        {
                            accountIndices: [
                                1, // nonce account address
                                3, // recent blockhashes sysvar
                                0, // nonce authority address
                            ],
                            data: new Uint8Array([4, 0, 0, 0]),
                            programAddressIndex: 2,
                        },
                    ],
                    lifetimeToken: nonce,
                    staticAccounts: [
                        // writable signers
                        nonceAuthorityAddress,
                        // no read-only signers
                        // writable non-signers
                        nonceAccountAddress,
                        // read-only non-signers
                        systemProgramAddress,
                        recentBlockhashesSysvarAddress,
                    ],
                    version: 0,
                },
                signatures: [feePayerSignature],
            };

            const transaction = decompileTransaction(compiledTransaction) as ITransactionWithSignatures;

            expect(transaction.signatures).toStrictEqual({
                [nonceAuthorityAddress]: feePayerSignature,
            });
        });

        it('converts a durable nonce transaction with multiple signers', () => {
            const feePayerSignature = new Uint8Array(Array(64).fill(1)) as SignatureBytes;
            const authoritySignature = new Uint8Array(Array(64).fill(2)) as SignatureBytes;

            const compiledTransaction: CompiledTransaction = {
                compiledMessage: {
                    header: {
                        numReadonlyNonSignerAccounts: 2, // recent blockhashes sysvar, system program
                        numReadonlySignerAccounts: 1, // nonce authority
                        numSignerAccounts: 2, // fee payer, nonce authority
                    },
                    instructions: [
                        {
                            accountIndices: [
                                2, // nonce account address
                                4, // recent blockhashes sysvar
                                1, // nonce authority address
                            ],
                            data: new Uint8Array([4, 0, 0, 0]),
                            programAddressIndex: 3,
                        },
                    ],
                    lifetimeToken: nonce,
                    staticAccounts: [
                        // writable signers
                        feePayer,
                        // read-only signers
                        nonceAuthorityAddress,
                        // writable non-signers
                        nonceAccountAddress,
                        // read-only non-signers
                        systemProgramAddress,
                        recentBlockhashesSysvarAddress,
                    ],
                    version: 0,
                },
                signatures: [feePayerSignature, authoritySignature],
            };

            const transaction = decompileTransaction(compiledTransaction) as ITransactionWithSignatures;

            expect(transaction.signatures).toStrictEqual({
                [feePayer]: feePayerSignature,
                [nonceAuthorityAddress]: authoritySignature,
            });
        });

        it('converts a partially signed durable nonce transaction with multiple signers', () => {
            const extraSignerAddress = '9bXC3RtDN5MzDMWRCqjgVTeQK2anMhdkq1ZoGN1Tb1UE' as Address;

            const feePayerSignature = new Uint8Array(Array(64).fill(1)) as SignatureBytes;
            const extraSignerSignature = new Uint8Array(Array(64).fill(2)) as SignatureBytes;

            // Used in the signatures array for a missing signature
            const noSignature = new Uint8Array(Array(64).fill(0)) as SignatureBytes;

            const compiledTransaction: CompiledTransaction = {
                compiledMessage: {
                    header: {
                        numReadonlyNonSignerAccounts: 2, // recent blockhashes sysvar, system program
                        numReadonlySignerAccounts: 2, // nonce authority, another signer
                        numSignerAccounts: 3, // fee payer, nonce authority, another signer
                    },
                    instructions: [
                        {
                            accountIndices: [
                                3, // nonce account address
                                5, // recent blockhashes sysvar
                                1, // nonce authority address
                            ],
                            data: new Uint8Array([4, 0, 0, 0]),
                            programAddressIndex: 4,
                        },
                        {
                            accountIndices: [2],
                            programAddressIndex: 4,
                        },
                    ],
                    lifetimeToken: nonce,
                    staticAccounts: [
                        // writable signers
                        feePayer,
                        // read-only signers
                        nonceAuthorityAddress,
                        extraSignerAddress,
                        // writable non-signers
                        nonceAccountAddress,
                        // read-only non-signers
                        systemProgramAddress,
                        recentBlockhashesSysvarAddress,
                    ],
                    version: 0,
                },
                signatures: [feePayerSignature, noSignature, extraSignerSignature],
            };

            const transaction = decompileTransaction(compiledTransaction) as ITransactionWithSignatures;

            expect(transaction.signatures).toStrictEqual({
                [extraSignerAddress]: extraSignerSignature,
                [feePayer]: feePayerSignature,
            });
        });
    });
});
