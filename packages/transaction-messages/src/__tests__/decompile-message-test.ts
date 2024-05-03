import '@solana/test-matchers/toBeFrozenObject';

import { Address } from '@solana/addresses';
import {
    SOLANA_ERROR__TRANSACTION__FAILED_TO_DECOMPILE_ADDRESS_LOOKUP_TABLE_CONTENTS_MISSING,
    SOLANA_ERROR__TRANSACTION__FAILED_TO_DECOMPILE_ADDRESS_LOOKUP_TABLE_INDEX_OUT_OF_RANGE,
    SolanaError,
} from '@solana/errors';
import { AccountRole, IAccountLookupMeta, IAccountMeta, IInstruction } from '@solana/instructions';

import { CompiledTransactionMessage } from '../compile';
import { decompileTransactionMessage } from '../decompile-message';
import { Nonce } from '../durable-nonce';

describe('decompileTransactionMessage', () => {
    const U64_MAX = 2n ** 64n - 1n;
    const feePayer = '7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK' as Address;

    describe('for a transaction with a blockhash lifetime', () => {
        const blockhash = 'J4yED2jcMAHyQUg61DBmm4njmEydUr2WqrV9cdEcDDgL';

        it('converts a transaction with no instructions', () => {
            const compiledTransaction: CompiledTransactionMessage = {
                header: {
                    numReadonlyNonSignerAccounts: 0,
                    numReadonlySignerAccounts: 0,
                    numSignerAccounts: 1,
                },
                instructions: [],
                lifetimeToken: blockhash,
                staticAccounts: [feePayer],
                version: 0,
            };

            const transaction = decompileTransactionMessage(compiledTransaction);

            expect(transaction.version).toBe(0);
            expect(transaction.feePayer).toEqual(feePayer);
            expect(transaction.lifetimeConstraint).toEqual({
                blockhash,
                lastValidBlockHeight: U64_MAX,
            });
        });

        it('freezes the blockhash lifetime constraint', () => {
            const compiledTransaction: CompiledTransactionMessage = {
                header: {
                    numReadonlyNonSignerAccounts: 0,
                    numReadonlySignerAccounts: 0,
                    numSignerAccounts: 1,
                },
                instructions: [],
                lifetimeToken: blockhash,
                staticAccounts: [feePayer],
                version: 0,
            };

            const transaction = decompileTransactionMessage(compiledTransaction);
            expect(transaction.lifetimeConstraint).toBeFrozenObject();
        });

        it('converts a transaction with version legacy', () => {
            const compiledTransaction: CompiledTransactionMessage = {
                header: {
                    numReadonlyNonSignerAccounts: 0,
                    numReadonlySignerAccounts: 0,
                    numSignerAccounts: 1,
                },
                instructions: [],
                lifetimeToken: blockhash,
                staticAccounts: [feePayer],
                version: 'legacy',
            };

            const transaction = decompileTransactionMessage(compiledTransaction);
            expect(transaction.version).toBe('legacy');
        });

        it('converts a transaction with one instruction with no accounts or data', () => {
            const programAddress = 'HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf' as Address;

            const compiledTransaction: CompiledTransactionMessage = {
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
            };

            const transaction = decompileTransactionMessage(compiledTransaction);
            const expectedInstruction: IInstruction = {
                programAddress,
            };
            expect(transaction.instructions).toStrictEqual([expectedInstruction]);
        });

        it('converts a transaction with one instruction with accounts and data', () => {
            const programAddress = 'HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf' as Address;

            const compiledTransaction: CompiledTransactionMessage = {
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
            };

            const transaction = decompileTransactionMessage(compiledTransaction);

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

        it('freezes the instruction accounts', () => {
            const programAddress = 'HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf' as Address;

            const compiledTransaction: CompiledTransactionMessage = {
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
            };

            const transaction = decompileTransactionMessage(compiledTransaction);
            expect(transaction.instructions[0].accounts).toBeFrozenObject();
        });

        it('converts a transaction with multiple instructions', () => {
            const compiledTransaction: CompiledTransactionMessage = {
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
            };

            const transaction = decompileTransactionMessage(compiledTransaction);

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

        it('converts a transaction with a given lastValidBlockHeight', () => {
            const compiledTransaction: CompiledTransactionMessage = {
                header: {
                    numReadonlyNonSignerAccounts: 0,
                    numReadonlySignerAccounts: 0,
                    numSignerAccounts: 1,
                },
                instructions: [],
                lifetimeToken: blockhash,
                staticAccounts: [feePayer],
                version: 0,
            };

            const transaction = decompileTransactionMessage(compiledTransaction, { lastValidBlockHeight: 100n });
            expect(transaction.lifetimeConstraint).toEqual({
                blockhash,
                lastValidBlockHeight: 100n,
            });
        });

        it('freezes the instructions within the transaction', () => {
            const programAddress = 'HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf' as Address;

            const compiledTransaction: CompiledTransactionMessage = {
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
            };

            const transaction = decompileTransactionMessage(compiledTransaction);
            expect(transaction.instructions[0]).toBeFrozenObject();
        });

        it('freezes the instructions array', () => {
            const programAddress = 'HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf' as Address;

            const compiledTransaction: CompiledTransactionMessage = {
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
            };

            const transaction = decompileTransactionMessage(compiledTransaction);
            expect(transaction.instructions).toBeFrozenObject();
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
            const compiledTransaction: CompiledTransactionMessage = {
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
            };

            const transaction = decompileTransactionMessage(compiledTransaction);

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

        it('freezes the nonce lifetime constraint', () => {
            const compiledTransaction: CompiledTransactionMessage = {
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
            };

            const transaction = decompileTransactionMessage(compiledTransaction);
            expect(transaction.lifetimeConstraint).toBeFrozenObject();
        });

        it('converts a transaction with one instruction which is advance nonce (fee payer is not nonce authority)', () => {
            const compiledTransaction: CompiledTransactionMessage = {
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
            };

            const transaction = decompileTransactionMessage(compiledTransaction);

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
            const compiledTransaction: CompiledTransactionMessage = {
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
            };

            const transaction = decompileTransactionMessage(compiledTransaction);

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

        it('freezes the instructions within the transaction', () => {
            const compiledTransaction: CompiledTransactionMessage = {
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
            };

            const transaction = decompileTransactionMessage(compiledTransaction);
            expect(transaction.instructions[0]).toBeFrozenObject();
            expect(transaction.instructions[1]).toBeFrozenObject();
            expect(transaction.instructions[2]).toBeFrozenObject();
        });

        it('freezes the instructions array', () => {
            const compiledTransaction: CompiledTransactionMessage = {
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
            };

            const transaction = decompileTransactionMessage(compiledTransaction);
            expect(transaction.instructions).toBeFrozenObject();
        });
    });

    describe('for a transaction with address lookup tables', () => {
        const blockhash = 'J4yED2jcMAHyQUg61DBmm4njmEydUr2WqrV9cdEcDDgL';
        const programAddress = 'HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf' as Address;

        describe('for one lookup table', () => {
            const lookupTableAddress = '9wnrQTq5MKhYfp379pKvpy1PvRyteseQmKv4Bw3uQrUw' as Address;

            it('converts an instruction with a single readonly lookup', () => {
                const addressInLookup = 'F1Vc6AGoxXLwGB7QV8f4So3C5d8SXEk3KKGHxKGEJ8qn' as Address;
                const lookupTables = {
                    [lookupTableAddress]: [addressInLookup],
                };

                const compiledTransaction: CompiledTransactionMessage = {
                    addressTableLookups: [
                        {
                            lookupTableAddress,
                            readableIndices: [0],
                            writableIndices: [],
                        },
                    ],
                    header: {
                        numReadonlyNonSignerAccounts: 1, // 1 program
                        numReadonlySignerAccounts: 0,
                        numSignerAccounts: 1, // fee payer
                    },
                    instructions: [
                        {
                            accountIndices: [2],
                            programAddressIndex: 1,
                        },
                    ],
                    lifetimeToken: blockhash,
                    staticAccounts: [feePayer, programAddress],
                    version: 0,
                };

                const transaction = decompileTransactionMessage(compiledTransaction, {
                    addressesByLookupTableAddress: lookupTables,
                });

                const expectedAccountLookupMeta: IAccountLookupMeta = {
                    address: addressInLookup,
                    addressIndex: 0,
                    lookupTableAddress,
                    role: AccountRole.READONLY,
                };

                expect(transaction.instructions).toStrictEqual([
                    {
                        accounts: [expectedAccountLookupMeta],
                        programAddress,
                    },
                ]);
            });

            it('converts an instruction with multiple readonly lookups', () => {
                const addressInLookup1 = 'F1Vc6AGoxXLwGB7QV8f4So3C5d8SXEk3KKGHxKGEJ8qn' as Address;
                const addressInLookup2 = '5g6b4v8ivF7haRWMUXT1aewBGsc8xY7B6efGadNc3xYk' as Address;
                const lookupTables = {
                    [lookupTableAddress]: [
                        addressInLookup1,
                        'HAv2PXRjwr4AL1odpoMNfvsw6bWxjDzURy1nPA6QBhDj' as Address,
                        addressInLookup2,
                    ],
                };

                const compiledTransaction: CompiledTransactionMessage = {
                    addressTableLookups: [
                        {
                            lookupTableAddress,
                            readableIndices: [0, 2],
                            writableIndices: [],
                        },
                    ],
                    header: {
                        numReadonlyNonSignerAccounts: 1, // 1 program
                        numReadonlySignerAccounts: 0,
                        numSignerAccounts: 1, // fee payer
                    },
                    instructions: [
                        {
                            accountIndices: [2, 3],
                            programAddressIndex: 1,
                        },
                    ],
                    lifetimeToken: blockhash,
                    staticAccounts: [feePayer, programAddress],
                    version: 0,
                };

                const transaction = decompileTransactionMessage(compiledTransaction, {
                    addressesByLookupTableAddress: lookupTables,
                });

                const expectedAccountLookupMetas: IAccountLookupMeta[] = [
                    {
                        address: addressInLookup1,
                        addressIndex: 0,
                        lookupTableAddress,
                        role: AccountRole.READONLY,
                    },
                    {
                        address: addressInLookup2,
                        addressIndex: 2,
                        lookupTableAddress,
                        role: AccountRole.READONLY,
                    },
                ];

                expect(transaction.instructions).toStrictEqual([
                    {
                        accounts: expectedAccountLookupMetas,
                        programAddress,
                    },
                ]);
            });

            it('converts an instruction with a single writable lookup', () => {
                const addressInLookup = 'F1Vc6AGoxXLwGB7QV8f4So3C5d8SXEk3KKGHxKGEJ8qn' as Address;
                const lookupTables = {
                    [lookupTableAddress]: [addressInLookup],
                };

                const compiledTransaction: CompiledTransactionMessage = {
                    addressTableLookups: [
                        {
                            lookupTableAddress,
                            readableIndices: [],
                            writableIndices: [0],
                        },
                    ],
                    header: {
                        numReadonlyNonSignerAccounts: 1, // 1 program
                        numReadonlySignerAccounts: 0,
                        numSignerAccounts: 1, // fee payer
                    },
                    instructions: [
                        {
                            accountIndices: [2],
                            programAddressIndex: 1,
                        },
                    ],
                    lifetimeToken: blockhash,
                    staticAccounts: [feePayer, programAddress],
                    version: 0,
                };

                const transaction = decompileTransactionMessage(compiledTransaction, {
                    addressesByLookupTableAddress: lookupTables,
                });

                const expectedAccountLookupMeta: IAccountLookupMeta = {
                    address: addressInLookup,
                    addressIndex: 0,
                    lookupTableAddress,
                    role: AccountRole.WRITABLE,
                };

                expect(transaction.instructions).toStrictEqual([
                    {
                        accounts: [expectedAccountLookupMeta],
                        programAddress,
                    },
                ]);
            });

            it('converts an instruction with multiple writable lookups', () => {
                const addressInLookup1 = 'F1Vc6AGoxXLwGB7QV8f4So3C5d8SXEk3KKGHxKGEJ8qn' as Address;
                const addressInLookup2 = '5g6b4v8ivF7haRWMUXT1aewBGsc8xY7B6efGadNc3xYk' as Address;
                const lookupTables = {
                    [lookupTableAddress]: [
                        addressInLookup1,
                        'HAv2PXRjwr4AL1odpoMNfvsw6bWxjDzURy1nPA6QBhDj' as Address,
                        addressInLookup2,
                    ],
                };

                const compiledTransaction: CompiledTransactionMessage = {
                    addressTableLookups: [
                        {
                            lookupTableAddress,
                            readableIndices: [],
                            writableIndices: [0, 2],
                        },
                    ],
                    header: {
                        numReadonlyNonSignerAccounts: 1, // 1 program
                        numReadonlySignerAccounts: 0,
                        numSignerAccounts: 1, // fee payer
                    },
                    instructions: [
                        {
                            accountIndices: [2, 3],
                            programAddressIndex: 1,
                        },
                    ],
                    lifetimeToken: blockhash,
                    staticAccounts: [feePayer, programAddress],
                    version: 0,
                };

                const transaction = decompileTransactionMessage(compiledTransaction, {
                    addressesByLookupTableAddress: lookupTables,
                });

                const expectedAccountLookupMetas: IAccountLookupMeta[] = [
                    {
                        address: addressInLookup1,
                        addressIndex: 0,
                        lookupTableAddress,
                        role: AccountRole.WRITABLE,
                    },
                    {
                        address: addressInLookup2,
                        addressIndex: 2,
                        lookupTableAddress,
                        role: AccountRole.WRITABLE,
                    },
                ];

                expect(transaction.instructions).toStrictEqual([
                    {
                        accounts: expectedAccountLookupMetas,
                        programAddress,
                    },
                ]);
            });

            it('converts an instruction with a readonly and a writable lookup', () => {
                const addressInLookup1 = 'F1Vc6AGoxXLwGB7QV8f4So3C5d8SXEk3KKGHxKGEJ8qn' as Address;
                const addressInLookup2 = '5g6b4v8ivF7haRWMUXT1aewBGsc8xY7B6efGadNc3xYk' as Address;
                const lookupTables = {
                    [lookupTableAddress]: [
                        addressInLookup1,
                        'HAv2PXRjwr4AL1odpoMNfvsw6bWxjDzURy1nPA6QBhDj' as Address,
                        addressInLookup2,
                    ],
                };

                const compiledTransaction: CompiledTransactionMessage = {
                    addressTableLookups: [
                        {
                            lookupTableAddress,
                            readableIndices: [0],
                            writableIndices: [2],
                        },
                    ],
                    header: {
                        numReadonlyNonSignerAccounts: 1, // 1 program
                        numReadonlySignerAccounts: 0,
                        numSignerAccounts: 1, // fee payer
                    },
                    instructions: [
                        {
                            accountIndices: [2, 3],
                            programAddressIndex: 1,
                        },
                    ],
                    lifetimeToken: blockhash,
                    staticAccounts: [feePayer, programAddress],
                    version: 0,
                };

                const transaction = decompileTransactionMessage(compiledTransaction, {
                    addressesByLookupTableAddress: lookupTables,
                });

                const expectedAccountLookupMetas: IAccountLookupMeta[] = [
                    // writable is first since we used account indices [2,3]
                    {
                        address: addressInLookup2,
                        addressIndex: 2,
                        lookupTableAddress,
                        role: AccountRole.WRITABLE,
                    },
                    {
                        address: addressInLookup1,
                        addressIndex: 0,
                        lookupTableAddress,
                        role: AccountRole.READONLY,
                    },
                ];

                expect(transaction.instructions).toStrictEqual([
                    {
                        accounts: expectedAccountLookupMetas,
                        programAddress,
                    },
                ]);
            });

            it('converts an instruction with a combination of static and lookup accounts', () => {
                const addressInLookup = 'F1Vc6AGoxXLwGB7QV8f4So3C5d8SXEk3KKGHxKGEJ8qn' as Address;
                const lookupTables = {
                    [lookupTableAddress]: [addressInLookup],
                };

                const staticAddress = 'GbRuWcHyNaVuE9rJE4sKpkHYa9k76VJBCCwGtf87ikH3' as Address;

                const compiledTransaction: CompiledTransactionMessage = {
                    addressTableLookups: [
                        {
                            lookupTableAddress,
                            readableIndices: [0],
                            writableIndices: [],
                        },
                    ],
                    header: {
                        numReadonlyNonSignerAccounts: 2, // 1 static address, 1 program
                        numReadonlySignerAccounts: 0,
                        numSignerAccounts: 1, // fee payer
                    },
                    instructions: [
                        {
                            accountIndices: [1, 3],
                            programAddressIndex: 2,
                        },
                    ],
                    lifetimeToken: blockhash,
                    staticAccounts: [feePayer, staticAddress, programAddress],
                    version: 0,
                };

                const transaction = decompileTransactionMessage(compiledTransaction, {
                    addressesByLookupTableAddress: lookupTables,
                });

                const expectedAccountMeta: IAccountMeta = {
                    address: staticAddress,
                    role: AccountRole.READONLY,
                };

                const expectedAccountLookupMeta: IAccountLookupMeta = {
                    address: addressInLookup,
                    addressIndex: 0,
                    lookupTableAddress,
                    role: AccountRole.READONLY,
                };

                expect(transaction.instructions).toStrictEqual([
                    {
                        accounts: [expectedAccountMeta, expectedAccountLookupMeta],
                        programAddress,
                    },
                ]);
            });

            it('converts multiple instructions with lookup accounts', () => {
                const addressInLookup1 = 'F1Vc6AGoxXLwGB7QV8f4So3C5d8SXEk3KKGHxKGEJ8qn' as Address;
                const addressInLookup2 = '5g6b4v8ivF7haRWMUXT1aewBGsc8xY7B6efGadNc3xYk' as Address;
                const lookupTables = {
                    [lookupTableAddress]: [
                        addressInLookup1,
                        'HAv2PXRjwr4AL1odpoMNfvsw6bWxjDzURy1nPA6QBhDj' as Address,
                        addressInLookup2,
                    ],
                };

                const compiledTransaction: CompiledTransactionMessage = {
                    addressTableLookups: [
                        {
                            lookupTableAddress,
                            readableIndices: [0],
                            writableIndices: [2],
                        },
                    ],
                    header: {
                        numReadonlyNonSignerAccounts: 1, // 1 program
                        numReadonlySignerAccounts: 0,
                        numSignerAccounts: 1, // fee payer
                    },
                    instructions: [
                        {
                            accountIndices: [2],
                            programAddressIndex: 1,
                        },
                        {
                            accountIndices: [3],
                            programAddressIndex: 1,
                        },
                    ],
                    lifetimeToken: blockhash,
                    staticAccounts: [feePayer, programAddress],
                    version: 0,
                };

                const transaction = decompileTransactionMessage(compiledTransaction, {
                    addressesByLookupTableAddress: lookupTables,
                });

                const expectedAccountLookupMeta1: IAccountLookupMeta = {
                    address: addressInLookup1,
                    addressIndex: 0,
                    lookupTableAddress,
                    role: AccountRole.READONLY,
                };

                const expectedAccountLookupMeta2: IAccountLookupMeta = {
                    address: addressInLookup2,
                    addressIndex: 2,
                    lookupTableAddress,
                    role: AccountRole.WRITABLE,
                };

                expect(transaction.instructions).toStrictEqual([
                    // first instruction uses index 2, which is the writable lookup
                    {
                        accounts: [expectedAccountLookupMeta2],
                        programAddress,
                    },
                    // second instruction uses index 3, the readonly lookup
                    {
                        accounts: [expectedAccountLookupMeta1],
                        programAddress,
                    },
                ]);
            });

            it('throws if the lookup table is not passed in', () => {
                const compiledTransaction: CompiledTransactionMessage = {
                    addressTableLookups: [
                        {
                            lookupTableAddress,
                            readableIndices: [0],
                            writableIndices: [],
                        },
                    ],
                    header: {
                        numReadonlyNonSignerAccounts: 1, // 1 program
                        numReadonlySignerAccounts: 0,
                        numSignerAccounts: 1, // fee payer
                    },
                    instructions: [
                        {
                            accountIndices: [2],
                            programAddressIndex: 1,
                        },
                    ],
                    lifetimeToken: blockhash,
                    staticAccounts: [feePayer, programAddress],
                    version: 0,
                };

                const fn = () => decompileTransactionMessage(compiledTransaction);
                expect(fn).toThrow(
                    new SolanaError(
                        SOLANA_ERROR__TRANSACTION__FAILED_TO_DECOMPILE_ADDRESS_LOOKUP_TABLE_CONTENTS_MISSING,
                        {
                            lookupTableAddresses: ['9wnrQTq5MKhYfp379pKvpy1PvRyteseQmKv4Bw3uQrUw'],
                        },
                    ),
                );
            });

            it('throws if a read index is outside the lookup table', () => {
                const addressInLookup = 'F1Vc6AGoxXLwGB7QV8f4So3C5d8SXEk3KKGHxKGEJ8qn' as Address;
                const lookupTables = {
                    [lookupTableAddress]: [addressInLookup],
                };

                const compiledTransaction: CompiledTransactionMessage = {
                    addressTableLookups: [
                        {
                            lookupTableAddress,
                            readableIndices: [1],
                            writableIndices: [],
                        },
                    ],
                    header: {
                        numReadonlyNonSignerAccounts: 1, // 1 program
                        numReadonlySignerAccounts: 0,
                        numSignerAccounts: 1, // fee payer
                    },
                    instructions: [
                        {
                            accountIndices: [2],
                            programAddressIndex: 1,
                        },
                    ],
                    lifetimeToken: blockhash,
                    staticAccounts: [feePayer, programAddress],
                    version: 0,
                };

                const fn = () =>
                    decompileTransactionMessage(compiledTransaction, { addressesByLookupTableAddress: lookupTables });
                expect(fn).toThrow(
                    new SolanaError(
                        SOLANA_ERROR__TRANSACTION__FAILED_TO_DECOMPILE_ADDRESS_LOOKUP_TABLE_INDEX_OUT_OF_RANGE,
                        {
                            highestKnownIndex: 0,
                            highestRequestedIndex: 1,
                            lookupTableAddress: '9wnrQTq5MKhYfp379pKvpy1PvRyteseQmKv4Bw3uQrUw',
                        },
                    ),
                );
            });

            it('throws if a write index is outside the lookup table', () => {
                const addressInLookup = 'F1Vc6AGoxXLwGB7QV8f4So3C5d8SXEk3KKGHxKGEJ8qn' as Address;
                const lookupTables = {
                    [lookupTableAddress]: [addressInLookup],
                };

                const compiledTransaction: CompiledTransactionMessage = {
                    addressTableLookups: [
                        {
                            lookupTableAddress,
                            readableIndices: [],
                            writableIndices: [1],
                        },
                    ],
                    header: {
                        numReadonlyNonSignerAccounts: 1, // 1 program
                        numReadonlySignerAccounts: 0,
                        numSignerAccounts: 1, // fee payer
                    },
                    instructions: [
                        {
                            accountIndices: [2],
                            programAddressIndex: 1,
                        },
                    ],
                    lifetimeToken: blockhash,
                    staticAccounts: [feePayer, programAddress],
                    version: 0,
                };

                const fn = () =>
                    decompileTransactionMessage(compiledTransaction, { addressesByLookupTableAddress: lookupTables });
                expect(fn).toThrow(
                    new SolanaError(
                        SOLANA_ERROR__TRANSACTION__FAILED_TO_DECOMPILE_ADDRESS_LOOKUP_TABLE_INDEX_OUT_OF_RANGE,
                        {
                            highestKnownIndex: 0,
                            highestRequestedIndex: 1,
                            lookupTableAddress: '9wnrQTq5MKhYfp379pKvpy1PvRyteseQmKv4Bw3uQrUw',
                        },
                    ),
                );
            });
        });

        describe('for multiple lookup tables', () => {
            const lookupTableAddress1 = '9wnrQTq5MKhYfp379pKvpy1PvRyteseQmKv4Bw3uQrUw' as Address;
            const lookupTableAddress2 = 'GS7Rphk6CZLoCGbTcbRaPZzD3k4ZK8XiA5BAj89Fi2Eg' as Address;
            const programAddress = 'HZMKVnRrWLyQLwPLTTLKtY7ET4Cf7pQugrTr9eTBrpsf' as Address;

            it('converts an instruction with readonly accounts from two lookup tables', () => {
                const addressInLookup1 = 'F1Vc6AGoxXLwGB7QV8f4So3C5d8SXEk3KKGHxKGEJ8qn' as Address;
                const addressInLookup2 = 'E7p56hzZZEs9vJ1yjxAFjhUP3fN2UJNk2nWvcY7Hz3ee' as Address;
                const lookupTables = {
                    [lookupTableAddress1]: [addressInLookup1],
                    [lookupTableAddress2]: [addressInLookup2],
                };

                const compiledTransaction: CompiledTransactionMessage = {
                    addressTableLookups: [
                        {
                            lookupTableAddress: lookupTableAddress1,
                            readableIndices: [0],
                            writableIndices: [],
                        },
                        {
                            lookupTableAddress: lookupTableAddress2,
                            readableIndices: [0],
                            writableIndices: [],
                        },
                    ],
                    header: {
                        numReadonlyNonSignerAccounts: 1, // 1 program
                        numReadonlySignerAccounts: 0,
                        numSignerAccounts: 1, // fee payer
                    },
                    instructions: [
                        {
                            accountIndices: [2, 3],
                            programAddressIndex: 1,
                        },
                    ],
                    lifetimeToken: blockhash,
                    staticAccounts: [feePayer, programAddress],
                    version: 0,
                };

                const transaction = decompileTransactionMessage(compiledTransaction, {
                    addressesByLookupTableAddress: lookupTables,
                });

                const expectedAccountLookupMetas: IAccountLookupMeta[] = [
                    {
                        address: addressInLookup1,
                        addressIndex: 0,
                        lookupTableAddress: lookupTableAddress1,
                        role: AccountRole.READONLY,
                    },
                    {
                        address: addressInLookup2,
                        addressIndex: 0,
                        lookupTableAddress: lookupTableAddress2,
                        role: AccountRole.READONLY,
                    },
                ];

                expect(transaction.instructions).toStrictEqual([
                    {
                        accounts: expectedAccountLookupMetas,
                        programAddress,
                    },
                ]);
            });

            it('converts an instruction with writable accounts from two lookup tables', () => {
                const addressInLookup1 = 'F1Vc6AGoxXLwGB7QV8f4So3C5d8SXEk3KKGHxKGEJ8qn' as Address;
                const addressInLookup2 = 'E7p56hzZZEs9vJ1yjxAFjhUP3fN2UJNk2nWvcY7Hz3ee' as Address;
                const lookupTables = {
                    [lookupTableAddress1]: [addressInLookup1],
                    [lookupTableAddress2]: [addressInLookup2],
                };

                const compiledTransaction: CompiledTransactionMessage = {
                    addressTableLookups: [
                        {
                            lookupTableAddress: lookupTableAddress1,
                            readableIndices: [],
                            writableIndices: [0],
                        },
                        {
                            lookupTableAddress: lookupTableAddress2,
                            readableIndices: [],
                            writableIndices: [0],
                        },
                    ],
                    header: {
                        numReadonlyNonSignerAccounts: 1, // 1 program
                        numReadonlySignerAccounts: 0,
                        numSignerAccounts: 1, // fee payer
                    },
                    instructions: [
                        {
                            accountIndices: [2, 3],
                            programAddressIndex: 1,
                        },
                    ],
                    lifetimeToken: blockhash,
                    staticAccounts: [feePayer, programAddress],
                    version: 0,
                };

                const transaction = decompileTransactionMessage(compiledTransaction, {
                    addressesByLookupTableAddress: lookupTables,
                });

                const expectedAccountLookupMetas: IAccountLookupMeta[] = [
                    {
                        address: addressInLookup1,
                        addressIndex: 0,
                        lookupTableAddress: lookupTableAddress1,
                        role: AccountRole.WRITABLE,
                    },
                    {
                        address: addressInLookup2,
                        addressIndex: 0,
                        lookupTableAddress: lookupTableAddress2,
                        role: AccountRole.WRITABLE,
                    },
                ];

                expect(transaction.instructions).toStrictEqual([
                    {
                        accounts: expectedAccountLookupMetas,
                        programAddress,
                    },
                ]);
            });

            it('converts an instruction with readonly and writable accounts from two lookup tables', () => {
                const readOnlyaddressInLookup1 = 'F1Vc6AGoxXLwGB7QV8f4So3C5d8SXEk3KKGHxKGEJ8qn' as Address;
                const readonlyAddressInLookup2 = 'E7p56hzZZEs9vJ1yjxAFjhUP3fN2UJNk2nWvcY7Hz3ee' as Address;
                const writableAddressInLookup1 = 'FgNrG1D7AoqNJuLc5eqmsXSHWta6Tfu41mQ9dgc5yaXo' as Address;
                const writableAddressInLookup2 = '9jEBzMuJfwWH1qcG4g1bj24iSLGCmTsedgisui7SVHes' as Address;

                const lookupTables = {
                    [lookupTableAddress1]: [readOnlyaddressInLookup1, writableAddressInLookup1],
                    [lookupTableAddress2]: [readonlyAddressInLookup2, writableAddressInLookup2],
                };

                const compiledTransaction: CompiledTransactionMessage = {
                    addressTableLookups: [
                        {
                            lookupTableAddress: lookupTableAddress1,
                            readableIndices: [0],
                            writableIndices: [1],
                        },
                        {
                            lookupTableAddress: lookupTableAddress2,
                            readableIndices: [0],
                            writableIndices: [1],
                        },
                    ],
                    header: {
                        numReadonlyNonSignerAccounts: 1, // 1 program
                        numReadonlySignerAccounts: 0,
                        numSignerAccounts: 1, // fee payer
                    },
                    /*
                            accountIndices:
                            0 - feePayer
                            1 - program
                            2 - writable from lookup1
                            3 - writable from lookup2
                            4 - readonly from lookup1
                            5 - readonly from lookup2
                        */
                    instructions: [
                        {
                            accountIndices: [2, 3, 4, 5],
                            programAddressIndex: 1,
                        },
                    ],
                    lifetimeToken: blockhash,
                    staticAccounts: [feePayer, programAddress],
                    version: 0,
                };

                const transaction = decompileTransactionMessage(compiledTransaction, {
                    addressesByLookupTableAddress: lookupTables,
                });

                const expectedAccountLookupMetas: IAccountLookupMeta[] = [
                    {
                        address: writableAddressInLookup1,
                        addressIndex: 1,
                        lookupTableAddress: lookupTableAddress1,
                        role: AccountRole.WRITABLE,
                    },
                    {
                        address: writableAddressInLookup2,
                        addressIndex: 1,
                        lookupTableAddress: lookupTableAddress2,
                        role: AccountRole.WRITABLE,
                    },
                    {
                        address: readOnlyaddressInLookup1,
                        addressIndex: 0,
                        lookupTableAddress: lookupTableAddress1,
                        role: AccountRole.READONLY,
                    },
                    {
                        address: readonlyAddressInLookup2,
                        addressIndex: 0,
                        lookupTableAddress: lookupTableAddress2,
                        role: AccountRole.READONLY,
                    },
                ];

                expect(transaction.instructions).toStrictEqual([
                    {
                        accounts: expectedAccountLookupMetas,
                        programAddress,
                    },
                ]);
            });

            it('converts multiple instructions with readonly and writable accounts from two lookup tables', () => {
                const readOnlyaddressInLookup1 = 'F1Vc6AGoxXLwGB7QV8f4So3C5d8SXEk3KKGHxKGEJ8qn' as Address;
                const readonlyAddressInLookup2 = 'E7p56hzZZEs9vJ1yjxAFjhUP3fN2UJNk2nWvcY7Hz3ee' as Address;
                const writableAddressInLookup1 = 'FgNrG1D7AoqNJuLc5eqmsXSHWta6Tfu41mQ9dgc5yaXo' as Address;
                const writableAddressInLookup2 = '9jEBzMuJfwWH1qcG4g1bj24iSLGCmTsedgisui7SVHes' as Address;

                const lookupTables = {
                    [lookupTableAddress1]: [readOnlyaddressInLookup1, writableAddressInLookup1],
                    [lookupTableAddress2]: [readonlyAddressInLookup2, writableAddressInLookup2],
                };

                const compiledTransaction: CompiledTransactionMessage = {
                    addressTableLookups: [
                        {
                            lookupTableAddress: lookupTableAddress1,
                            readableIndices: [0],
                            writableIndices: [1],
                        },
                        {
                            lookupTableAddress: lookupTableAddress2,
                            readableIndices: [0],
                            writableIndices: [1],
                        },
                    ],
                    header: {
                        numReadonlyNonSignerAccounts: 1, // 1 program
                        numReadonlySignerAccounts: 0,
                        numSignerAccounts: 1, // fee payer
                    },
                    /*
                            accountIndices:
                            0 - feePayer
                            1 - program
                            2 - writable from lookup1
                            3 - writable from lookup2
                            4 - readonly from lookup1
                            5 - readonly from lookup2
                        */
                    instructions: [
                        {
                            accountIndices: [2, 5],
                            programAddressIndex: 1,
                        },
                        {
                            accountIndices: [3, 4],
                            programAddressIndex: 1,
                        },
                    ],
                    lifetimeToken: blockhash,
                    staticAccounts: [feePayer, programAddress],
                    version: 0,
                };

                const transaction = decompileTransactionMessage(compiledTransaction, {
                    addressesByLookupTableAddress: lookupTables,
                });

                const expectedAccountLookupMetasInstruction1: IAccountLookupMeta[] = [
                    // index 2 - writable from lookup1
                    {
                        address: writableAddressInLookup1,
                        addressIndex: 1,
                        lookupTableAddress: lookupTableAddress1,
                        role: AccountRole.WRITABLE,
                    },
                    // index 5 - readonly from lookup2
                    {
                        address: readonlyAddressInLookup2,
                        addressIndex: 0,
                        lookupTableAddress: lookupTableAddress2,
                        role: AccountRole.READONLY,
                    },
                ];

                const expectedAccountLookupMetasInstruction2: IAccountLookupMeta[] = [
                    // index 3 - writable from lookup2
                    {
                        address: writableAddressInLookup2,
                        addressIndex: 1,
                        lookupTableAddress: lookupTableAddress2,
                        role: AccountRole.WRITABLE,
                    },
                    // index 4 - readonly from lookup1
                    {
                        address: readOnlyaddressInLookup1,
                        addressIndex: 0,
                        lookupTableAddress: lookupTableAddress1,
                        role: AccountRole.READONLY,
                    },
                ];

                expect(transaction.instructions).toStrictEqual([
                    {
                        accounts: expectedAccountLookupMetasInstruction1,
                        programAddress,
                    },
                    {
                        accounts: expectedAccountLookupMetasInstruction2,
                        programAddress,
                    },
                ]);
            });

            it('throws if multiple lookup tables are not passed in', () => {
                const compiledTransaction: CompiledTransactionMessage = {
                    addressTableLookups: [
                        {
                            lookupTableAddress: lookupTableAddress1,
                            readableIndices: [0],
                            writableIndices: [],
                        },
                        {
                            lookupTableAddress: lookupTableAddress2,
                            readableIndices: [0],
                            writableIndices: [],
                        },
                    ],
                    header: {
                        numReadonlyNonSignerAccounts: 1, // 1 program
                        numReadonlySignerAccounts: 0,
                        numSignerAccounts: 1, // fee payer
                    },
                    instructions: [
                        {
                            accountIndices: [2],
                            programAddressIndex: 1,
                        },
                    ],
                    lifetimeToken: blockhash,
                    staticAccounts: [feePayer, programAddress],
                    version: 0,
                };

                const fn = () => decompileTransactionMessage(compiledTransaction);
                expect(fn).toThrow(
                    new SolanaError(
                        SOLANA_ERROR__TRANSACTION__FAILED_TO_DECOMPILE_ADDRESS_LOOKUP_TABLE_CONTENTS_MISSING,
                        {
                            lookupTableAddresses: [
                                '9wnrQTq5MKhYfp379pKvpy1PvRyteseQmKv4Bw3uQrUw',
                                'GS7Rphk6CZLoCGbTcbRaPZzD3k4ZK8XiA5BAj89Fi2Eg',
                            ],
                        },
                    ),
                );
            });
        });
    });
});
