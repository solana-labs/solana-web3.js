import { Address } from '@solana/addresses';
import { AccountRole } from '@solana/instructions';
import { PublicKey } from '@solana/web3.js';
import { fromLegacyPublicKey } from './address';

export interface LegacyTransactionInstructionKey {
  isSigner: boolean;
  isWritable: boolean;
  pubkey: PublicKey;
}

export interface LegacyTransactionInstruction {
  data: Buffer;
  keys: LegacyTransactionInstructionKey[];
  programId: PublicKey;
}

export interface IInstructionAccount {
  readonly address: Address;
  readonly role: AccountRole;
}

export interface IInstruction {
  readonly accounts?: IInstructionAccount[];
  readonly data?: Uint8Array;
  readonly programAddress: Address;
}

export function fromLegacyTransactionInstruction(
  instruction: LegacyTransactionInstruction
): IInstruction {
  return {
    accounts: instruction.keys.map(mapLegacyKeyToInstructionAccount),
    data: instruction.data.length > 0 
      ? new Uint8Array(instruction.data) 
      : undefined,
    programAddress: fromLegacyPublicKey(instruction.programId)
  };
}

function mapLegacyKeyToInstructionAccount(
  key: LegacyTransactionInstructionKey
): IInstructionAccount {
  return {
    address: fromLegacyPublicKey(key.pubkey),
    role: determineAccountRole(key)
  };
}

function determineAccountRole(
  key: Pick<LegacyTransactionInstructionKey, 'isWritable' | 'isSigner'>
): AccountRole {
  const { isWritable, isSigner } = key;

  if (isWritable && isSigner) return AccountRole.WRITABLE_SIGNER;
  if (isWritable) return AccountRole.WRITABLE;
  if (isSigner) return AccountRole.READONLY_SIGNER;
  
  return AccountRole.READONLY;
}