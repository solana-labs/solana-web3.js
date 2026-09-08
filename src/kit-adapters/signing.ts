import {
  assertIsTransactionSigner,
  assertIsTransactionWithinSizeLimit,
  getCompiledTransactionMessageDecoder,
  getTransactionLifetimeConstraintFromCompiledTransactionMessage,
  isTransactionPartialSigner,
  partiallySignTransactionWithSigners,
  signatureBytes,
  type Transaction as KitTransaction,
  type TransactionWithLifetime,
} from '@solana/kit';

import {PublicKey} from '../publickey';
import type {Signer} from '../keypair';
import {SIGNATURE_LENGTH_IN_BYTES} from '../transaction/constants';
import {toPackedUint8Array} from '../utils/typed-array';
import {asTransactionMessageBytes} from './brand';

type SignaturePair = Readonly<{
  publicKey: PublicKey;
  signature?: Uint8Array | null;
}>;

/** @internal */
export function getSignerPublicKey(signer: Signer): PublicKey {
  return new PublicKey(signer.address);
}

/**
 * Derive the Kit lifetime constraint of serialized legacy or versioned
 * message bytes using Kit's own inference: a message whose first instruction
 * is the System program's `AdvanceNonceAccount` instruction has a durable
 * nonce lifetime and carries the nonce value in its `recentBlockhash` field;
 * any other message has a blockhash lifetime, defaulting to the maximum
 * `lastValidBlockHeight` when the caller provides none.
 *
 * @internal
 */
export async function getLifetimeConstraintForCompiledMessageBytes(
  messageBytes: Uint8Array,
  lastValidBlockHeight?: bigint,
): Promise<TransactionWithLifetime['lifetimeConstraint']> {
  const compiledMessage = getCompiledTransactionMessageDecoder().decode(
    toPackedUint8Array(messageBytes),
  );
  const lifetimeConstraint =
    await getTransactionLifetimeConstraintFromCompiledTransactionMessage(
      compiledMessage,
    );
  if ('blockhash' in lifetimeConstraint && lastValidBlockHeight != null) {
    return {...lifetimeConstraint, lastValidBlockHeight};
  }
  return lifetimeConstraint;
}

/**
 * Sign the serialized bytes of a legacy or versioned transaction message with
 * Kit `TransactionPartialSigner`s by delegating to Kit's
 * `partiallySignTransactionWithSigners`, which runs them in parallel and
 * merges their signature dictionaries.
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
    if (!isTransactionPartialSigner(signer)) {
      throw new Error(
        `Signer for address ${address} does not implement the Kit ` +
          'TransactionPartialSigner interface',
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
