import { AccountRole, IInstruction } from '@solana/instructions';
import { AccountMeta, TransactionInstruction } from '@solana/web3.js';

export function fromLegacyTransactionInstruction(legacyInstruction: TransactionInstruction): IInstruction {
    const accounts = legacyInstruction.keys.map(key => ({
        address: key.pubkey.toBase58(),
        role: getAccountRoleByAccountMeta(key),
    }));

    return {
        data: Uint8Array.from(legacyInstruction.data),
        accounts,
        programAddress: legacyInstruction.programId.toBase58(),
    };
}

function getAccountRoleByAccountMeta(accountMeta: AccountMeta): AccountRole {
    if (accountMeta.isSigner && accountMeta.isWritable) return AccountRole.WRITABLE_SIGNER;
    if (accountMeta.isSigner) return AccountRole.READONLY_SIGNER;
    if (accountMeta.isWritable) return AccountRole.WRITABLE;
    return AccountRole.READONLY;
}
