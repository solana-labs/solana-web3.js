import { Address } from '@solana/addresses';
import { IInstruction } from '@solana/instructions';
import { AccountRole } from '@solana/instructions';
import { TransactionInstruction } from '@solana/web3.js';

import { fromLegacyPublicKey } from './address';
/**
 * Convert from a Legacy TransactionInstruction to a IInstruction type
 * @param TransactionInstruction the transactioninstruction to convert
 * @returns         An IInstruction
 */
export function fromLegacyTransactionInstruction(instruction: TransactionInstruction): IInstruction {
    return {
        accounts: instruction.keys.map(key => ({
            address: fromLegacyPublicKey(key.pubkey),
            role: getAccountRole(key.isWritable, key.isSigner),
        })),
        data: new Uint8Array(instruction.data),
        programAddress: instruction.programId as Address,
    };
}

function getAccountRole(isWritable: boolean, isSigner: boolean): AccountRole {
    if (isWritable && isSigner) return AccountRole.WRITABLE_SIGNER;
    if (isWritable) return AccountRole.WRITABLE;
    if (isSigner) return AccountRole.READONLY_SIGNER;
    return AccountRole.READONLY;
}

