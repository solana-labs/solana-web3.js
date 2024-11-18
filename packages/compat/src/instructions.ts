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
 * Converts a legacy Solana Web3.js transaction instruction to the IInstruction format.
 * This transformation standardizes the structure and makes it compatible with the
 * Address and AccountRole types used in the application.
 *
 * @param instruction - The legacy transaction instruction to be converted.
 *                      It includes the program ID, accounts (with signer and writable flags), and data buffer.
 * @returns An object of type IInstruction, containing:
 *          - `accounts`: A list of accounts with standardized addresses and roles.
 *          - `data`: The instruction's data, converted to a Uint8Array.
 *          - `programAddress`: The standardized address of the program associated with the instruction.
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

/**
 * Determine the account role based on its writable and signer flags
 * @param isWritable Whether the account is writable
 * @param isSigner   Whether the account is a signer
 * @returns          The corresponding AccountRole
 */
function getAccountRole(isWritable: boolean, isSigner: boolean): AccountRole {
    if (isWritable && isSigner) return AccountRole.WRITABLE_SIGNER;
    if (isWritable) return AccountRole.WRITABLE;
    if (isSigner) return AccountRole.READONLY_SIGNER;
    return AccountRole.READONLY;
}
