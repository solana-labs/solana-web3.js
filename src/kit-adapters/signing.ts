import {
  AccountRole,
  type Address,
  assertIsTransactionSigner,
  assertIsTransactionWithinSizeLimit,
  type Blockhash,
  isAdvanceNonceAccountInstruction,
  isTransactionModifyingSigner,
  isTransactionPartialSigner,
  partiallySignTransactionWithSigners,
  signatureBytes,
  type Transaction as KitTransaction,
  type TransactionWithLifetime,
} from '@solana/kit';

import {PublicKey} from '../publickey';
import type {Signer} from '../keypair';
import type {MessageCompiledInstruction} from '../message';
import {SIGNATURE_LENGTH_IN_BYTES} from '../transaction/constants';
import {toPackedUint8Array} from '../utils/typed-array';
import {asTransactionMessageBytes, blockhashAsNonce} from './brand';

type SignaturePair = Readonly<{
  publicKey: PublicKey;
  signature?: Uint8Array | null;
}>;

/**
 * A compiled transaction message does not carry a `lastValidBlockHeight`.
 * When the caller provides none, signing uses the maximum possible value,
 * matching Kit's behavior in the same situation.
 */
export const MAX_LAST_VALID_BLOCK_HEIGHT = 0xffffffffffffffffn;

/** @internal */
export function getSignerPublicKey(signer: Signer): PublicKey {
  return new PublicKey(signer.address);
}

/**
 * A compiled legacy or versioned message, reduced to the properties needed to
 * derive its lifetime constraint. Both `Message` and `MessageV0` satisfy it.
 * @internal
 */
type CompiledMessageForLifetime = Readonly<{
  compiledInstructions: ReadonlyArray<MessageCompiledInstruction>;
  isAccountSigner(index: number): boolean;
  isAccountWritable(index: number): boolean;
  recentBlockhash: Blockhash;
  staticAccountKeys: ReadonlyArray<PublicKey>;
}>;

/**
 * Derive the Kit lifetime constraint of a compiled message, mirroring Kit's
 * own inference when decompiling: a message whose first instruction is the
 * System program's `AdvanceNonceAccount` instruction has a durable nonce
 * lifetime and carries the nonce value in its `recentBlockhash` field; any
 * other message has a blockhash lifetime, defaulting to the maximum
 * `lastValidBlockHeight` when the caller provides none.
 *
 * A first instruction that loads accounts from an address lookup table cannot
 * be inspected without the table contents and is treated as a blockhash
 * lifetime.
 *
 * @internal
 */
export function getLifetimeConstraintForCompiledMessage(
  message: CompiledMessageForLifetime,
  lastValidBlockHeight?: bigint,
): TransactionWithLifetime['lifetimeConstraint'] {
  const nonceAccountAddress = getDurableNonceAccountAddress(message);
  if (nonceAccountAddress != null) {
    return {
      nonce: blockhashAsNonce(message.recentBlockhash),
      nonceAccountAddress,
    };
  }
  return {
    blockhash: message.recentBlockhash,
    lastValidBlockHeight: lastValidBlockHeight ?? MAX_LAST_VALID_BLOCK_HEIGHT,
  };
}

function getDurableNonceAccountAddress(
  message: CompiledMessageForLifetime,
): Address | undefined {
  const instruction = message.compiledInstructions[0];
  if (instruction == null) {
    return undefined;
  }
  // An AdvanceNonceAccount instruction has exactly three accounts; bail
  // before resolving addresses for anything else.
  if (instruction.accountKeyIndexes.length !== 3) {
    return undefined;
  }
  const programId = message.staticAccountKeys[instruction.programIdIndex];
  if (programId == null) {
    return undefined;
  }
  const accounts: Array<{address: Address; role: AccountRole}> = [];
  for (const index of instruction.accountKeyIndexes) {
    const publicKey = message.staticAccountKeys[index];
    if (publicKey == null) {
      // The account comes from an address lookup table.
      return undefined;
    }
    accounts.push({
      address: publicKey.toBase58(),
      role: getAccountRole(
        message.isAccountSigner(index),
        message.isAccountWritable(index),
      ),
    });
  }
  const kitInstruction = {
    accounts,
    data: instruction.data,
    programAddress: programId.toBase58(),
  };
  return isAdvanceNonceAccountInstruction(kitInstruction)
    ? kitInstruction.accounts[0].address
    : undefined;
}

function getAccountRole(isSigner: boolean, isWritable: boolean): AccountRole {
  if (isSigner) {
    return isWritable
      ? AccountRole.WRITABLE_SIGNER
      : AccountRole.READONLY_SIGNER;
  }
  return isWritable ? AccountRole.WRITABLE : AccountRole.READONLY;
}

/**
 * Sign the serialized bytes of a legacy or versioned transaction message with
 * Kit transaction signers by delegating to Kit's
 * `partiallySignTransactionWithSigners`: `TransactionModifyingSigner`s run
 * first sequentially (each may return a modified transaction), then
 * `TransactionPartialSigner`s sign in parallel.
 *
 * Returns the signed Kit transaction. Its `messageBytes` may differ from the
 * input when a modifying signer altered the message; callers must reconcile
 * their own state with the returned bytes and signature dictionary.
 *
 * @internal
 */
export async function signTransactionMessageBytes(
  signers: readonly Signer[],
  messageBytes: Uint8Array,
  requiredSignerPublicKeys: readonly PublicKey[],
  signatures: readonly SignaturePair[],
  lifetimeConstraint: TransactionWithLifetime['lifetimeConstraint'],
): Promise<KitTransaction & TransactionWithLifetime> {
  for (const signer of signers) {
    assertIsTransactionSigner(signer);
    const {address} = signer;
    if (
      !isTransactionPartialSigner(signer) &&
      !isTransactionModifyingSigner(signer)
    ) {
      throw new Error(
        `Signer for address ${address} can only sign and send a ` +
          'transaction in a single step (Kit TransactionSendingSigner). ' +
          'Signing without sending requires the TransactionPartialSigner ' +
          'or TransactionModifyingSigner interface',
      );
    }
  }
  const transaction = {
    lifetimeConstraint,
    messageBytes: asTransactionMessageBytes(toPackedUint8Array(messageBytes)),
    signatures: buildSignatureMap(requiredSignerPublicKeys, signatures),
  } satisfies KitTransaction & TransactionWithLifetime;
  assertIsTransactionWithinSizeLimit(transaction);
  return await partiallySignTransactionWithSigners(signers, transaction);
}

function buildSignatureMap(
  requiredSignerPublicKeys: readonly PublicKey[],
  signatures: readonly SignaturePair[],
): KitTransaction['signatures'] {
  const signatureMap: KitTransaction['signatures'] = {};
  for (const publicKey of requiredSignerPublicKeys) {
    signatureMap[publicKey.toBase58()] = null;
  }
  for (const {publicKey, signature} of signatures) {
    if (signature != null && !isAllZeroSignature(signature)) {
      signatureMap[publicKey.toBase58()] = signatureBytes(signature);
    }
  }
  return signatureMap;
}

function isAllZeroSignature(signature: Uint8Array): boolean {
  if (signature.length !== SIGNATURE_LENGTH_IN_BYTES) return false;
  for (let i = 0; i < signature.length; i++) {
    if (signature[i] !== 0) return false;
  }
  return true;
}
