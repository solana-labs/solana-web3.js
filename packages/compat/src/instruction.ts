import { AccountRole, IInstruction } from '@solana/instructions/src';
import { TransactionInstruction } from '@solana/web3.js';

import { fromLegacyPublicKey } from './address';

export function fromLegacyTransactionInstruction(legacyInstruction: TransactionInstruction): IInstruction {
    // Map data (Buffer -> Uint8Array)
    const data = legacyInstruction.data ? Uint8Array.from(legacyInstruction.data) : undefined;

    // Map keys (pubkey -> address, isSigner/isWritable -> role)
    const accounts = legacyInstruction.keys.map(key => ({
        address: fromLegacyPublicKey(key.pubkey), // Convert PublicKey to string
        role: determineRole(key.isSigner, key.isWritable), // Map role
    }));

    // Map programId (PublicKey -> Address)
    const programAddress = fromLegacyPublicKey(legacyInstruction.programId);

    return {
        accounts,
        data,
        programAddress,
    };
}

// Helper function to determine the role
function determineRole(isSigner: boolean, isWritable: boolean): AccountRole {
    if (isSigner && isWritable) return AccountRole.WRITABLE_SIGNER;
    if (isSigner) return AccountRole.READONLY_SIGNER;
    if (isWritable) return AccountRole.WRITABLE;
    return AccountRole.READONLY;
}
