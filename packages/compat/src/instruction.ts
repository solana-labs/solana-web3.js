import { Address } from '@solana/addresses';
import { AccountRole } from '@solana/instructions';
import { PublicKey } from '@solana/web3.js';

import { fromLegacyPublicKey } from './address';

type LegacyTransactionInstruction = {
    data: Buffer;
    keys: Array<{
        isSigner: boolean;
        isWritable: boolean;
        pubkey: PublicKey;
    }>;
    programId: PublicKey;
};

interface IInstruction {
    readonly accounts?: Array<{
        readonly address: Address;
        readonly role: AccountRole;
    }>;
    readonly data?: Uint8Array;
    readonly programAddress: Address;
}

/**
 * Convert from a Legacy Web3 JS TransactionInstruction to an IInstruction
 * @param instruction The TransactionInstruction to convert
 * @returns          An IInstruction
 */
export function fromLegacyTransactionInstruction(instruction: LegacyTransactionInstruction): IInstruction {
    return {
        accounts: instruction.keys.map(key => ({
            address: fromLegacyPublicKey(key.pubkey),
            role: getAccountRole(key.isWritable, key.isSigner),
        })),
        data: new Uint8Array(instruction.data),
        programAddress: fromLegacyPublicKey(instruction.programId),
    };
}

function getAccountRole(isWritable: boolean, isSigner: boolean): AccountRole {
    if (isWritable && isSigner) return AccountRole.WRITABLE_SIGNER;
    if (isWritable) return AccountRole.WRITABLE;
    if (isSigner) return AccountRole.READONLY_SIGNER;
    return AccountRole.READONLY;
}
