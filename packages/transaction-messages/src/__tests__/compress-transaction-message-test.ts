import '@solana/test-matchers/toBeFrozenObject';

import { Address } from '@solana/addresses';
import { pipe } from '@solana/functional';
import { AccountRole, IAccountLookupMeta, IAccountMeta, IInstruction } from '@solana/instructions';

import { AddressesByLookupTableAddress } from '../addresses-by-lookup-table-address';
import { compressTransactionMessageUsingAddressLookupTables } from '../compress-transaction-message';
import { createTransactionMessage } from '../create-transaction-message';
import { appendTransactionMessageInstruction, appendTransactionMessageInstructions } from '../instructions';

const programAddress = 'program' as Address;

describe('compressTransactionMessageUsingAddressLookupTables', () => {
    it('should replace a read-only account with a lookup table', () => {
        const address = 'address1' as Address;
        const lookupTableAddress = 'lookupTableAddress' as Address;

        const transactionMessage = pipe(createTransactionMessage({ version: 0 }), tx =>
            appendTransactionMessageInstruction(
                {
                    accounts: [
                        {
                            address,
                            role: AccountRole.READONLY,
                        },
                    ],
                    programAddress,
                },
                tx,
            ),
        );

        const lookupTables: AddressesByLookupTableAddress = {
            [lookupTableAddress]: [address],
        };

        const result = compressTransactionMessageUsingAddressLookupTables(transactionMessage, lookupTables);

        const expectedLookupMeta: IAccountLookupMeta = {
            address,
            addressIndex: 0,
            lookupTableAddress,
            role: AccountRole.READONLY,
        };

        expect(result.instructions[0].accounts![0]).toStrictEqual(expectedLookupMeta);
    });

    it('should replace a writable account with a lookup table', () => {
        const address = 'address1' as Address;
        const lookupTableAddress = 'lookupTableAddress' as Address;

        const transactionMessage = pipe(createTransactionMessage({ version: 0 }), tx =>
            appendTransactionMessageInstruction(
                {
                    accounts: [
                        {
                            address,
                            role: AccountRole.WRITABLE,
                        },
                    ],
                    programAddress,
                },
                tx,
            ),
        );

        const lookupTables: AddressesByLookupTableAddress = {
            [lookupTableAddress]: [address],
        };

        const result = compressTransactionMessageUsingAddressLookupTables(transactionMessage, lookupTables);

        const expectedLookupMeta: IAccountLookupMeta = {
            address,
            addressIndex: 0,
            lookupTableAddress,
            role: AccountRole.WRITABLE,
        };

        expect(result.instructions[0].accounts![0]).toStrictEqual(expectedLookupMeta);
    });

    it('should not replace a read-only signer account with a lookup table', () => {
        const address = 'address1' as Address;
        const lookupTableAddress = 'lookupTableAddress' as Address;

        const accountMeta: IAccountMeta = {
            address,
            role: AccountRole.READONLY_SIGNER,
        };

        const transactionMessage = pipe(createTransactionMessage({ version: 0 }), tx =>
            appendTransactionMessageInstruction(
                {
                    accounts: [accountMeta],
                    programAddress,
                },
                tx,
            ),
        );

        const lookupTables: AddressesByLookupTableAddress = {
            [lookupTableAddress]: [address],
        };

        const result = compressTransactionMessageUsingAddressLookupTables(transactionMessage, lookupTables);

        expect(result.instructions[0].accounts![0]).toStrictEqual(accountMeta);
    });

    it('should not replace a writable signer account with a lookup table', () => {
        const address = 'address1' as Address;
        const lookupTableAddress = 'lookupTableAddress' as Address;

        const accountMeta: IAccountMeta = {
            address,
            role: AccountRole.WRITABLE_SIGNER,
        };

        const transactionMessage = pipe(createTransactionMessage({ version: 0 }), tx =>
            appendTransactionMessageInstruction(
                {
                    accounts: [accountMeta],
                    programAddress,
                },
                tx,
            ),
        );

        const lookupTables: AddressesByLookupTableAddress = {
            [lookupTableAddress]: [address],
        };

        const result = compressTransactionMessageUsingAddressLookupTables(transactionMessage, lookupTables);

        expect(result.instructions[0].accounts![0]).toStrictEqual(accountMeta);
    });

    it('should not modify an account that is already from a lookup table', () => {
        const address = 'address1' as Address;
        const lookupTableAddress = 'lookupTableAddress' as Address;

        const lookupMeta: IAccountLookupMeta = {
            address,
            addressIndex: 0,
            lookupTableAddress,
            role: AccountRole.READONLY,
        };

        const transactionMessage = pipe(createTransactionMessage({ version: 0 }), tx =>
            appendTransactionMessageInstruction(
                {
                    accounts: [lookupMeta],
                    programAddress,
                },
                tx,
            ),
        );

        const lookupTables: AddressesByLookupTableAddress = {
            [lookupTableAddress]: [address],
        };

        const result = compressTransactionMessageUsingAddressLookupTables(transactionMessage, lookupTables);

        expect(result.instructions[0].accounts![0]).toStrictEqual(lookupMeta);
    });

    it('should replace multiple accounts with different addresses from a lookup table', () => {
        const address1 = 'address1' as Address;
        const address2 = 'address2' as Address;
        const lookupTableAddress = 'lookupTableAddress' as Address;

        const transactionMessage = pipe(createTransactionMessage({ version: 0 }), tx =>
            appendTransactionMessageInstruction(
                {
                    accounts: [
                        {
                            address: address1,
                            role: AccountRole.READONLY,
                        },
                        {
                            address: address2,
                            role: AccountRole.WRITABLE,
                        },
                    ],
                    programAddress,
                },
                tx,
            ),
        );

        const lookupTables: AddressesByLookupTableAddress = {
            [lookupTableAddress]: [address1, address2],
        };

        const result = compressTransactionMessageUsingAddressLookupTables(transactionMessage, lookupTables);

        const expectedLookupMeta1: IAccountLookupMeta = {
            address: address1,
            addressIndex: 0,
            lookupTableAddress,
            role: AccountRole.READONLY,
        };

        const expectedLookupMeta2: IAccountLookupMeta = {
            address: address2,
            addressIndex: 1,
            lookupTableAddress,
            role: AccountRole.WRITABLE,
        };

        expect(result.instructions[0].accounts![0]).toStrictEqual(expectedLookupMeta1);
        expect(result.instructions[0].accounts![1]).toStrictEqual(expectedLookupMeta2);
    });

    it('should replace the same account in multiple instructions from a lookup table', () => {
        const address = 'address1' as Address;
        const lookupTableAddress = 'lookupTableAddress' as Address;

        const transactionMessage = pipe(
            createTransactionMessage({ version: 0 }),
            tx =>
                appendTransactionMessageInstruction(
                    {
                        accounts: [
                            {
                                address,
                                role: AccountRole.READONLY,
                            },
                        ],
                        programAddress,
                    },
                    tx,
                ),
            tx =>
                appendTransactionMessageInstruction(
                    {
                        accounts: [
                            {
                                address,
                                role: AccountRole.READONLY,
                            },
                        ],
                        programAddress,
                    },
                    tx,
                ),
        );

        const lookupTables: AddressesByLookupTableAddress = {
            [lookupTableAddress]: [address],
        };

        const result = compressTransactionMessageUsingAddressLookupTables(transactionMessage, lookupTables);

        const expectedLookupMeta: IAccountLookupMeta = {
            address: address,
            addressIndex: 0,
            lookupTableAddress,
            role: AccountRole.READONLY,
        };

        expect(result.instructions[0].accounts![0]).toStrictEqual(expectedLookupMeta);
        expect(result.instructions[1].accounts![0]).toStrictEqual(expectedLookupMeta);
    });

    it('should replace multiple accounts with different addresses from different lookup tables', () => {
        const address1 = 'address1' as Address;
        const address2 = 'address2' as Address;
        const lookupTableAddress1 = 'lookupTableAddress1' as Address;
        const lookupTableAddress2 = 'lookupTableAddress2' as Address;

        const transactionMessage = pipe(createTransactionMessage({ version: 0 }), tx =>
            appendTransactionMessageInstruction(
                {
                    accounts: [
                        {
                            address: address1,
                            role: AccountRole.READONLY,
                        },
                        {
                            address: address2,
                            role: AccountRole.WRITABLE,
                        },
                    ],
                    programAddress,
                },
                tx,
            ),
        );

        const lookupTables: AddressesByLookupTableAddress = {
            [lookupTableAddress1]: [address1],
            [lookupTableAddress2]: [address2],
        };

        const result = compressTransactionMessageUsingAddressLookupTables(transactionMessage, lookupTables);

        const expectedLookupMeta1: IAccountLookupMeta = {
            address: address1,
            addressIndex: 0,
            lookupTableAddress: lookupTableAddress1,
            role: AccountRole.READONLY,
        };

        const expectedLookupMeta2: IAccountLookupMeta = {
            address: address2,
            addressIndex: 0,
            lookupTableAddress: lookupTableAddress2,
            role: AccountRole.WRITABLE,
        };

        expect(result.instructions[0].accounts![0]).toStrictEqual(expectedLookupMeta1);
        expect(result.instructions[0].accounts![1]).toStrictEqual(expectedLookupMeta2);
    });

    it('should not replace an account that is not in lookup tables', () => {
        const address = 'address1' as Address;
        const lookupTableAddress = 'lookupTableAddress' as Address;

        const transactionMessage = pipe(createTransactionMessage({ version: 0 }), tx =>
            appendTransactionMessageInstruction(
                {
                    accounts: [
                        {
                            address,
                            role: AccountRole.READONLY,
                        },
                    ],
                    programAddress,
                },
                tx,
            ),
        );

        const lookupTables: AddressesByLookupTableAddress = {
            [lookupTableAddress]: ['abc' as Address],
        };

        const result = compressTransactionMessageUsingAddressLookupTables(transactionMessage, lookupTables);

        expect(result.instructions[0].accounts![0]).toStrictEqual({
            address,
            role: AccountRole.READONLY,
        });
    });

    it('should replace some accounts if there is a mix of signers and not', () => {
        const address1 = 'address1' as Address;
        const address2 = 'address2' as Address;

        const lookupTableAddress = 'lookupTableAddress' as Address;

        const transactionMessage = pipe(
            createTransactionMessage({ version: 0 }),
            tx =>
                // address1 and address2 are non-signers in this instruction
                appendTransactionMessageInstruction(
                    {
                        accounts: [
                            {
                                address: address1,
                                role: AccountRole.READONLY,
                            },
                            {
                                address: address2,
                                role: AccountRole.WRITABLE,
                            },
                        ],
                        programAddress,
                    },
                    tx,
                ),
            // address2 is a signer in this instruction
            tx =>
                appendTransactionMessageInstruction(
                    {
                        accounts: [
                            {
                                address: address1,
                                role: AccountRole.READONLY,
                            },
                            {
                                address: address2,
                                role: AccountRole.READONLY_SIGNER,
                            },
                        ],
                        programAddress,
                    },
                    tx,
                ),
        );

        const lookupTables: AddressesByLookupTableAddress = {
            [lookupTableAddress]: [address1, address2],
        };

        const result = compressTransactionMessageUsingAddressLookupTables(transactionMessage, lookupTables);

        expect(result.instructions[0].accounts![0]).toStrictEqual({
            address: address1,
            addressIndex: 0,
            lookupTableAddress,
            role: AccountRole.READONLY,
        });

        // address2 uses the LUT in the first instruction
        expect(result.instructions[0].accounts![1]).toStrictEqual({
            address: address2,
            addressIndex: 1,
            lookupTableAddress,
            role: AccountRole.WRITABLE,
        });

        expect(result.instructions[1].accounts![0]).toStrictEqual({
            address: address1,
            addressIndex: 0,
            lookupTableAddress,
            role: AccountRole.READONLY,
        });

        // but not the second
        expect(result.instructions[1].accounts![1]).toStrictEqual({
            address: address2,
            role: AccountRole.READONLY_SIGNER,
        });
    });

    it('should return the input instruction if no accounts are replaced', () => {
        const address = 'address1' as Address;
        const lookupTableAddress = 'lookupTableAddress' as Address;

        const instruction: IInstruction = {
            accounts: [
                {
                    address,
                    role: AccountRole.READONLY_SIGNER,
                },
            ],
            programAddress,
        };

        const transactionMessage = pipe(createTransactionMessage({ version: 0 }), tx =>
            appendTransactionMessageInstruction(instruction, tx),
        );

        const lookupTables: AddressesByLookupTableAddress = {
            [lookupTableAddress]: [address],
        };

        const result = compressTransactionMessageUsingAddressLookupTables(transactionMessage, lookupTables);

        expect(result.instructions[0]).toBe(instruction);
    });

    it('should return the input transaction message if no accounts are replaced in any instruction', () => {
        const address = 'address1' as Address;
        const lookupTableAddress = 'lookupTableAddress' as Address;

        const transactionMessage = pipe(createTransactionMessage({ version: 0 }), tx =>
            appendTransactionMessageInstructions(
                [
                    {
                        accounts: [
                            {
                                address,
                                role: AccountRole.READONLY_SIGNER,
                            },
                        ],
                        programAddress,
                    },
                    {
                        accounts: [
                            {
                                address,
                                role: AccountRole.READONLY_SIGNER,
                            },
                        ],
                        programAddress,
                    },
                ],
                tx,
            ),
        );

        const lookupTables: AddressesByLookupTableAddress = {
            [lookupTableAddress]: [address],
        };

        const result = compressTransactionMessageUsingAddressLookupTables(transactionMessage, lookupTables);

        expect(result).toBe(transactionMessage);
    });

    it('should freeze the returned transaction message', () => {
        const address = 'address1' as Address;
        const lookupTableAddress = 'lookupTableAddress' as Address;

        const transactionMessage = pipe(createTransactionMessage({ version: 0 }), tx =>
            appendTransactionMessageInstruction(
                {
                    accounts: [
                        {
                            address,
                            role: AccountRole.READONLY,
                        },
                    ],
                    programAddress,
                },
                tx,
            ),
        );

        const lookupTables: AddressesByLookupTableAddress = {
            [lookupTableAddress]: [address],
        };

        const result = compressTransactionMessageUsingAddressLookupTables(transactionMessage, lookupTables);

        expect(result).toBeFrozenObject();
    });

    it('should freeze the instructions in the returned transaction message', () => {
        const address = 'address1' as Address;
        const lookupTableAddress = 'lookupTableAddress' as Address;

        const transactionMessage = pipe(createTransactionMessage({ version: 0 }), tx =>
            appendTransactionMessageInstruction(
                {
                    accounts: [
                        {
                            address,
                            role: AccountRole.READONLY,
                        },
                    ],
                    programAddress,
                },
                tx,
            ),
        );

        const lookupTables: AddressesByLookupTableAddress = {
            [lookupTableAddress]: [address],
        };

        const result = compressTransactionMessageUsingAddressLookupTables(transactionMessage, lookupTables);

        expect(result.instructions[0]).toBeFrozenObject();
    });

    it('should freeze the replaced accounts in the returned transaction message', () => {
        const address = 'address1' as Address;
        const lookupTableAddress = 'lookupTableAddress' as Address;

        const transactionMessage = pipe(createTransactionMessage({ version: 0 }), tx =>
            appendTransactionMessageInstruction(
                {
                    accounts: [
                        {
                            address,
                            role: AccountRole.READONLY,
                        },
                    ],
                    programAddress,
                },
                tx,
            ),
        );

        const lookupTables: AddressesByLookupTableAddress = {
            [lookupTableAddress]: [address],
        };

        const result = compressTransactionMessageUsingAddressLookupTables(transactionMessage, lookupTables);

        expect(result.instructions[0].accounts![0]).toBeFrozenObject();
    });
});
