import { Address } from '@solana/addresses';
import { IInstruction } from '@solana/instructions';
import { TransactionInstruction } from '@solana/web3.js';
/**
 * Convert from a Legacy TransactionInstruction to a IInstruction type
 * @param TransactionInstruction the transactioninstruction to convert
 * @returns         An IInstruction
 */
export function fromLegacyTransactionInstruction(transactionInstruction: TransactionInstruction): IInstruction {
    return {
        accounts: transactionInstruction.keys.map(key => ({
            address: key.pubkey as Address,
            role: {
                isSigner: key.isSigner,
                isWritable: key.isWritable,
            },
        })),
        data: new Uint8Array(transactionInstruction.data),
        programAddress: transactionInstruction.programId as Address,
    };
}
