export type {Ed25519Keypair} from 'legacy-shared';
export {
  Keypair,
  MAX_SEED_LENGTH,
  PUBLIC_KEY_LENGTH,
  PublicKey,
  type Signer,
  type PublicKeyInitData,
  type PublicKeyData,
} from '@solana/keys';
import {
  Enum_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  SOLANA_SCHEMA_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  Struct_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
} from '@solana/keys';
export const Enum = Enum_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
export const SOLANA_SCHEMA = SOLANA_SCHEMA_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
export const Struct = Struct_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
export * from './account';
export * from './blockhash';
export * from './bpf-loader-deprecated';
export * from './bpf-loader';
export * from './connection';
export * from './epoch-schedule';
export * from './errors';
export * from './fee-calculator';
export * from './loader';
export * from './message';
export * from './nonce-account';
export * from './programs';
export * from './transaction';
export * from './validator-info';
export * from './vote-account';
export * from './sysvar';
export * from './utils';

/**
 * There are 1-billion lamports in one SOL
 */
export const LAMPORTS_PER_SOL = 1000000000;
