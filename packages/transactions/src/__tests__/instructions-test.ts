import 'test-matchers/toBeFrozenObject';

import { Address } from '@solana/addresses';
import { IInstruction } from '@solana/instructions';

import { appendTransactionInstruction, prependTransactionInstruction } from '../instructions';
import { ITransactionWithSignatures } from '../signatures';
import { BaseTransaction } from '../types';

const PROGRAM_A =
    'AALQD2dt1k43Acrkp4SvdhZaN4S115Ff2Bi7rHPti3sL' as Address<'AALQD2dt1k43Acrkp4SvdhZaN4S115Ff2Bi7rHPti3sL'>;
const PROGRAM_B =
    'DNAbkMkoMLRXF7wuLCrTzouMyzi25krr3B94yW87VvxU' as Address<'DNAbkMkoMLRXF7wuLCrTzouMyzi25krr3B94yW87VvxU'>;

describe('Transaction instruction helpers', () => {
    let baseTx: BaseTransaction;
    let exampleInstruction: IInstruction<string>;
    beforeEach(() => {
        baseTx = {
            instructions: [
                {
                    programAddress: PROGRAM_A,
                },
            ],
            version: 0,
        };
        exampleInstruction = {
            programAddress: PROGRAM_B,
        };
    });
    describe('appendTransactionInstruction', () => {
        it('adds the instruction to the end of the list', () => {
            const txWithAddedInstruction = appendTransactionInstruction(exampleInstruction, baseTx);
            expect(txWithAddedInstruction.instructions).toMatchObject([...baseTx.instructions, exampleInstruction]);
        });
        describe('given a transaction with signatures', () => {
            let txWithSignatures: BaseTransaction & ITransactionWithSignatures;
            beforeEach(() => {
                txWithSignatures = {
                    ...baseTx,
                    signatures: {},
                };
            });
            it('clears the signatures when the fee payer is different than the current one', () => {
                expect(appendTransactionInstruction(exampleInstruction, txWithSignatures)).not.toHaveProperty(
                    'signatures'
                );
            });
        });
        it('freezes the object', () => {
            const txWithAddedInstruction = appendTransactionInstruction(exampleInstruction, baseTx);
            expect(txWithAddedInstruction).toBeFrozenObject();
        });
    });
    describe('prependTransactionInstruction', () => {
        it('adds the instruction to the beginning of the list', () => {
            const txWithAddedInstruction = prependTransactionInstruction(exampleInstruction, baseTx);
            expect(txWithAddedInstruction.instructions).toMatchObject([exampleInstruction, ...baseTx.instructions]);
        });
        describe('given a transaction with signatures', () => {
            let txWithSignatures: BaseTransaction & ITransactionWithSignatures;
            beforeEach(() => {
                txWithSignatures = {
                    ...baseTx,
                    signatures: {},
                };
            });
            it('clears the signatures when the fee payer is different than the current one', () => {
                expect(prependTransactionInstruction(exampleInstruction, txWithSignatures)).not.toHaveProperty(
                    'signatures'
                );
            });
        });
        it('freezes the object', () => {
            const txWithAddedInstruction = prependTransactionInstruction(exampleInstruction, baseTx);
            expect(txWithAddedInstruction).toBeFrozenObject();
        });
    });
});
