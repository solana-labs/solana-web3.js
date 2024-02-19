import '@solana/test-matchers/toBeFrozenObject';

import { Address } from '@solana/addresses';
import { IInstruction } from '@solana/instructions';

import {
    appendTransactionInstruction,
    appendTransactionInstructions,
    prependTransactionInstruction,
    prependTransactionInstructions,
} from '../instructions';
import { ITransactionWithSignatures } from '../signatures';
import { BaseTransaction } from '../types';

const PROGRAM_A =
    'AALQD2dt1k43Acrkp4SvdhZaN4S115Ff2Bi7rHPti3sL' as Address<'AALQD2dt1k43Acrkp4SvdhZaN4S115Ff2Bi7rHPti3sL'>;
const PROGRAM_B =
    'DNAbkMkoMLRXF7wuLCrTzouMyzi25krr3B94yW87VvxU' as Address<'DNAbkMkoMLRXF7wuLCrTzouMyzi25krr3B94yW87VvxU'>;
const PROGRAM_C =
    '6Bkt4j67rxzFF6s9DaMRyfitftRrGxe4oYHPRHuFChzi' as Address<'6Bkt4j67rxzFF6s9DaMRyfitftRrGxe4oYHPRHuFChzi'>;

describe('Transaction instruction helpers', () => {
    let baseTx: BaseTransaction;
    let exampleInstruction: IInstruction<string>;
    let secondExampleInstruction: IInstruction<string>;
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
        secondExampleInstruction = {
            programAddress: PROGRAM_C,
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
            it('clears the transaction signatures', () => {
                expect(appendTransactionInstruction(exampleInstruction, txWithSignatures)).not.toHaveProperty(
                    'signatures',
                );
            });
        });
        it('freezes the object', () => {
            const txWithAddedInstruction = appendTransactionInstruction(exampleInstruction, baseTx);
            expect(txWithAddedInstruction).toBeFrozenObject();
        });
    });
    describe('appendTransactionInstructions', () => {
        it('adds the instructions to the end of the list', () => {
            const txWithAddedInstructions = appendTransactionInstructions(
                [exampleInstruction, secondExampleInstruction],
                baseTx,
            );
            expect(txWithAddedInstructions.instructions).toMatchObject([
                ...baseTx.instructions,
                exampleInstruction,
                secondExampleInstruction,
            ]);
        });
        describe('given a transaction with signatures', () => {
            let txWithSignatures: BaseTransaction & ITransactionWithSignatures;
            beforeEach(() => {
                txWithSignatures = {
                    ...baseTx,
                    signatures: {},
                };
            });
            it('clears the transaction signatures', () => {
                expect(
                    appendTransactionInstructions([exampleInstruction, secondExampleInstruction], txWithSignatures),
                ).not.toHaveProperty('signatures');
            });
        });
        it('freezes the object', () => {
            const txWithAddedInstruction = appendTransactionInstructions(
                [exampleInstruction, secondExampleInstruction],
                baseTx,
            );
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
            it('clears the transaction signatures', () => {
                expect(prependTransactionInstruction(exampleInstruction, txWithSignatures)).not.toHaveProperty(
                    'signatures',
                );
            });
        });
        it('freezes the object', () => {
            const txWithAddedInstruction = prependTransactionInstruction(exampleInstruction, baseTx);
            expect(txWithAddedInstruction).toBeFrozenObject();
        });
    });
    describe('prependTransactionInstructions', () => {
        it('adds the instructions to the beginning of the list', () => {
            const txWithAddedInstruction = prependTransactionInstructions(
                [exampleInstruction, secondExampleInstruction],
                baseTx,
            );
            expect(txWithAddedInstruction.instructions).toMatchObject([
                exampleInstruction,
                secondExampleInstruction,
                ...baseTx.instructions,
            ]);
        });
        describe('given a transaction with signatures', () => {
            let txWithSignatures: BaseTransaction & ITransactionWithSignatures;
            beforeEach(() => {
                txWithSignatures = {
                    ...baseTx,
                    signatures: {},
                };
            });
            it('clears the transaction signatures', () => {
                expect(
                    prependTransactionInstructions([exampleInstruction, secondExampleInstruction], txWithSignatures),
                ).not.toHaveProperty('signatures');
            });
        });
        it('freezes the object', () => {
            const txWithAddedInstruction = prependTransactionInstructions(
                [exampleInstruction, secondExampleInstruction],
                baseTx,
            );
            expect(txWithAddedInstruction).toBeFrozenObject();
        });
    });
});
