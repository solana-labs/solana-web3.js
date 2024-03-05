import '@solana/test-matchers/toBeFrozenObject';

import { Address } from '@solana/addresses';
import { SOLANA_ERROR__SIGNER__ADDRESS_CANNOT_HAVE_MULTIPLE_SIGNERS, SolanaError } from '@solana/errors';
import { AccountRole, IInstruction } from '@solana/instructions';
import { BaseTransaction } from '@solana/transactions';

import { IAccountSignerMeta, IInstructionWithSigners } from '../account-signer-meta';
import { addSignersToInstruction, addSignersToTransaction } from '../add-signers';
import { createMockTransactionModifyingSigner, createMockTransactionPartialSigner } from './__setup__';

describe('addSignersToInstruction', () => {
    it('adds signers to the account metas of the instruction', () => {
        // Given an instruction with signer account metas.
        const instruction: IInstruction = {
            accounts: [
                { address: '1111' as Address, role: AccountRole.READONLY_SIGNER },
                { address: '2222' as Address, role: AccountRole.WRITABLE_SIGNER },
            ],
            data: new Uint8Array([]),
            programAddress: '9999' as Address,
        };

        // And two associated signers.
        const signerA = createMockTransactionPartialSigner('1111' as Address);
        const signerB = createMockTransactionModifyingSigner('2222' as Address);

        // When we add the signers to the instruction.
        const instructionWithSigners = addSignersToInstruction([signerA, signerB], instruction);

        // Then the instruction's account metas now store the provided signers.
        expect(instructionWithSigners.accounts).toStrictEqual([
            { address: '1111' as Address, role: AccountRole.READONLY_SIGNER, signer: signerA },
            { address: '2222' as Address, role: AccountRole.WRITABLE_SIGNER, signer: signerB },
        ]);
    });

    it('ignores account metas that already have a signer', () => {
        // Given an instruction with a signer account metas that already has a signer A attached to it.
        const signerA = createMockTransactionPartialSigner('1111' as Address);
        const instruction: IInstruction & IInstructionWithSigners = {
            accounts: [
                {
                    address: '1111' as Address,
                    role: AccountRole.READONLY_SIGNER,
                    signer: signerA,
                } as IAccountSignerMeta,
            ],
            data: new Uint8Array([]),
            programAddress: '9999' as Address,
        };

        // When we try to add a signer B to the instruction matching the signer A's address.
        const signerB = createMockTransactionPartialSigner('1111' as Address);
        const instructionWithSigners = addSignersToInstruction([signerB], instruction);

        // Then the instruction's account meta still stores the signer A.
        expect(instructionWithSigners.accounts).toStrictEqual([
            { address: '1111' as Address, role: AccountRole.READONLY_SIGNER, signer: signerA },
        ]);
    });

    it('ignores account metas that do not have a signer role', () => {
        // Given an instruction with a non-signer account metas.
        const instruction: IInstruction = {
            accounts: [{ address: '1111' as Address, role: AccountRole.WRITABLE }],
            data: new Uint8Array([]),
            programAddress: '9999' as Address,
        };

        // When we try to add a signer to the instruction matching the non-signer account metas's address.
        const signer = createMockTransactionPartialSigner('1111' as Address);
        const instructionWithSigners = addSignersToInstruction([signer], instruction);

        // Then the instruction's account meta still doesn't store the signer.
        expect(instructionWithSigners.accounts).toStrictEqual([
            { address: '1111' as Address, role: AccountRole.WRITABLE },
        ]);
    });

    it('can add the same signer to multiple account metas', () => {
        // Given an instruction with two signer account metas that share the same address.
        const instruction: IInstruction = {
            accounts: [
                { address: '1111' as Address, role: AccountRole.READONLY_SIGNER },
                { address: '1111' as Address, role: AccountRole.WRITABLE_SIGNER },
            ],
            data: new Uint8Array([]),
            programAddress: '9999' as Address,
        };

        // When we add a signer matching this address to the instruction.
        const signer = createMockTransactionPartialSigner('1111' as Address);
        const instructionWithSigners = addSignersToInstruction([signer], instruction);

        // Then the instruction's account metas now store the provided signer on both account metas.
        expect(instructionWithSigners.accounts).toStrictEqual([
            { address: '1111' as Address, role: AccountRole.READONLY_SIGNER, signer },
            { address: '1111' as Address, role: AccountRole.WRITABLE_SIGNER, signer },
        ]);
    });

    it('fails if two distincts signers are provided for the same address', () => {
        // Given an instruction with a signer account meta.
        const instruction: IInstruction = {
            accounts: [{ address: '1111' as Address, role: AccountRole.READONLY_SIGNER }],
            data: new Uint8Array([]),
            programAddress: '9999' as Address,
        };

        // And two distinct signers for the same address.
        const signerA = createMockTransactionPartialSigner('1111' as Address);
        const signerB = createMockTransactionModifyingSigner('1111' as Address);

        // When we try to add the signers to the instruction.
        const fn = () => addSignersToInstruction([signerA, signerB], instruction);

        // Then we expect an error to be thrown.
        expect(fn).toThrow(
            new SolanaError(SOLANA_ERROR__SIGNER__ADDRESS_CANNOT_HAVE_MULTIPLE_SIGNERS, {
                address: '1111',
            }),
        );
    });

    it('freezes the returned instruction', () => {
        // Given an instruction with a signer account metas.
        const instruction: IInstruction = {
            accounts: [{ address: '1111' as Address, role: AccountRole.READONLY_SIGNER }],
            data: new Uint8Array([]),
            programAddress: '9999' as Address,
        };

        // When we add a signer to the instruction.
        const signer = createMockTransactionPartialSigner('1111' as Address);
        const instructionWithSigners = addSignersToInstruction([signer], instruction);

        // Then the returned instruction is frozen and so are its updated account metas.
        expect(instructionWithSigners).toBeFrozenObject();
        expect(instructionWithSigners.accounts![0]).toBeFrozenObject();
    });

    it('returns the instruction as-is if it has no account metas', () => {
        // Given an instruction with no account metas.
        const instruction: IInstruction = {
            accounts: [],
            data: new Uint8Array([]),
            programAddress: '9999' as Address,
        };

        // When we try to add signers to the instruction.
        const instructionWithSigners = addSignersToInstruction([], instruction);

        // Then the returned instruction is the same as the original.
        expect(instructionWithSigners).toBe(instruction);
    });
});

describe('addSignersToTransaction', () => {
    it('adds signers to the account metas of the transaction', () => {
        // Given a transaction with two instructions with signer account metas.
        const instructionA: IInstruction = {
            accounts: [{ address: '1111' as Address, role: AccountRole.READONLY_SIGNER }],
            data: new Uint8Array([]),
            programAddress: '8888' as Address,
        };
        const instructionB: IInstruction = {
            accounts: [{ address: '2222' as Address, role: AccountRole.WRITABLE_SIGNER }],
            data: new Uint8Array([]),
            programAddress: '9999' as Address,
        };
        const transaction: BaseTransaction = {
            instructions: [instructionA, instructionB],
            version: 0,
        };

        // And two associated signers.
        const signerA = createMockTransactionPartialSigner('1111' as Address);
        const signerB = createMockTransactionModifyingSigner('2222' as Address);

        // When we add the signers to the transaction.
        const transactionWithSigners = addSignersToTransaction([signerA, signerB], transaction);

        // Then the transaction's account metas now store the provided signers.
        expect(transactionWithSigners.instructions[0].accounts).toStrictEqual([
            { address: '1111' as Address, role: AccountRole.READONLY_SIGNER, signer: signerA },
        ]);
        expect(transactionWithSigners.instructions[1].accounts).toStrictEqual([
            { address: '2222' as Address, role: AccountRole.WRITABLE_SIGNER, signer: signerB },
        ]);
    });

    it('freezes the returned transaction', () => {
        // Given a one-instruction transaction with signer account metas.
        const transaction: BaseTransaction = {
            instructions: [
                {
                    accounts: [{ address: '1111' as Address, role: AccountRole.READONLY_SIGNER }],
                    data: new Uint8Array([]),
                    programAddress: '8888' as Address,
                },
            ],
            version: 0,
        };

        // When we add signers to the transaction.
        const signer = createMockTransactionPartialSigner('1111' as Address);
        const transactionWithSigners = addSignersToTransaction([signer], transaction);

        // Then the returned transaction is frozen and so are its updated instructions and account metas.
        expect(transactionWithSigners).toBeFrozenObject();
        expect(transactionWithSigners.instructions[0]).toBeFrozenObject();
        expect(transactionWithSigners.instructions[0].accounts![0]).toBeFrozenObject();
    });

    it('returns the transaction as-is if it has no instructions', () => {
        // Given transaction with no instructions.
        const transaction: BaseTransaction = { instructions: [], version: 0 };

        // When we try to add signers to the transaction.
        const signer = createMockTransactionPartialSigner('1111' as Address);
        const transactionWithSigners = addSignersToTransaction([signer], transaction);

        // Then the returned transaction is the same as the original.
        expect(transactionWithSigners).toBe(transaction);
    });
});
