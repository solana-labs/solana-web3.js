import '@solana/test-matchers/toBeFrozenObject';

import { Address } from '@solana/addresses';
import { IInstruction } from '@solana/instructions';

import {
    appendTransactionMessageInstruction,
    appendTransactionMessageInstructions,
    prependTransactionMessageInstruction,
    prependTransactionMessageInstructions,
} from '../instructions';
import { BaseTransactionMessage } from '../transaction-message';

const PROGRAM_A =
    'AALQD2dt1k43Acrkp4SvdhZaN4S115Ff2Bi7rHPti3sL' as Address<'AALQD2dt1k43Acrkp4SvdhZaN4S115Ff2Bi7rHPti3sL'>;
const PROGRAM_B =
    'DNAbkMkoMLRXF7wuLCrTzouMyzi25krr3B94yW87VvxU' as Address<'DNAbkMkoMLRXF7wuLCrTzouMyzi25krr3B94yW87VvxU'>;
const PROGRAM_C =
    '6Bkt4j67rxzFF6s9DaMRyfitftRrGxe4oYHPRHuFChzi' as Address<'6Bkt4j67rxzFF6s9DaMRyfitftRrGxe4oYHPRHuFChzi'>;

describe('Transaction instruction helpers', () => {
    let baseTx: BaseTransactionMessage;
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
    describe('appendTransactionMessageInstruction', () => {
        it('adds the instruction to the end of the list', () => {
            const txWithAddedInstruction = appendTransactionMessageInstruction(exampleInstruction, baseTx);
            expect(txWithAddedInstruction.instructions).toMatchObject([...baseTx.instructions, exampleInstruction]);
        });
        it('freezes the object', () => {
            const txWithAddedInstruction = appendTransactionMessageInstruction(exampleInstruction, baseTx);
            expect(txWithAddedInstruction).toBeFrozenObject();
        });
    });
    describe('appendTransactionMessageInstructions', () => {
        it('adds the instructions to the end of the list', () => {
            const txWithAddedInstructions = appendTransactionMessageInstructions(
                [exampleInstruction, secondExampleInstruction],
                baseTx,
            );
            expect(txWithAddedInstructions.instructions).toMatchObject([
                ...baseTx.instructions,
                exampleInstruction,
                secondExampleInstruction,
            ]);
        });
        it('freezes the object', () => {
            const txWithAddedInstruction = appendTransactionMessageInstructions(
                [exampleInstruction, secondExampleInstruction],
                baseTx,
            );
            expect(txWithAddedInstruction).toBeFrozenObject();
        });
    });
    describe('prependTransactionMessageInstruction', () => {
        it('adds the instruction to the beginning of the list', () => {
            const txWithAddedInstruction = prependTransactionMessageInstruction(exampleInstruction, baseTx);
            expect(txWithAddedInstruction.instructions).toMatchObject([exampleInstruction, ...baseTx.instructions]);
        });
        it('freezes the object', () => {
            const txWithAddedInstruction = prependTransactionMessageInstruction(exampleInstruction, baseTx);
            expect(txWithAddedInstruction).toBeFrozenObject();
        });
    });
    describe('prependTransactionMessageInstructions', () => {
        it('adds the instructions to the beginning of the list', () => {
            const txWithAddedInstruction = prependTransactionMessageInstructions(
                [exampleInstruction, secondExampleInstruction],
                baseTx,
            );
            expect(txWithAddedInstruction.instructions).toMatchObject([
                exampleInstruction,
                secondExampleInstruction,
                ...baseTx.instructions,
            ]);
        });
        it('freezes the object', () => {
            const txWithAddedInstruction = prependTransactionMessageInstructions(
                [exampleInstruction, secondExampleInstruction],
                baseTx,
            );
            expect(txWithAddedInstruction).toBeFrozenObject();
        });
    });
});
