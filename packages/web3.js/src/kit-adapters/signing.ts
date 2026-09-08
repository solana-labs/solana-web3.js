import {
  assertIsTransactionPartialSigner,
  getCompiledTransactionMessageDecoder,
  getTransactionLifetimeConstraintFromCompiledTransactionMessage,
  isSolanaError,
  partiallySignTransactionWithSigners,
  signatureBytes,
  SignaturesMap,
  SOLANA_ERROR__TRANSACTION__NONCE_ACCOUNT_CANNOT_BE_IN_LOOKUP_TABLE,
  TransactionBlockhashLifetime,
  TransactionDurableNonceLifetime,
  type Transaction as KitTransaction,
  type TransactionWithLifetime,
} from '@solana/kit';

import {PublicKey} from '../publickey';
import type {Signer} from '../keypair';
import {SIGNATURE_LENGTH_IN_BYTES} from '../transaction/constants';
import {toPackedUint8Array} from '../utils/typed-array';
import {asTransactionMessageBytes} from './brand';

const COMPILED_TRANSACTION_MESSAGE_DECODER =
  getCompiledTransactionMessageDecoder();

type SignaturePair = Readonly<{
  publicKey: PublicKey;
  signature?: Uint8Array | null;
}>;

/** @internal */
export function getSignerPublicKey(signer: Signer): PublicKey {
  return new PublicKey(signer.address);
}

/**
 * Derive the Kit lifetime constraint of a serialized transaction message.
 * Returns `undefined` for a durable nonce message whose nonce account is
 * loaded from an address lookup table, since that address cannot be resolved
 * without fetching the table.
 *
 * @internal
 */
export async function getLifetimeConstraintForCompiledMessageBytes(
  messageBytes: Uint8Array,
  lastValidBlockHeight?: bigint,
): Promise<TransactionWithLifetime['lifetimeConstraint'] | undefined> {
  const compiledMessage = COMPILED_TRANSACTION_MESSAGE_DECODER.decode(
    toPackedUint8Array(messageBytes),
  );
  let lifetimeConstraint;
  try {
    lifetimeConstraint =
      await getTransactionLifetimeConstraintFromCompiledTransactionMessage(
        compiledMessage,
      );
  } catch (e) {
    if (
      isSolanaError(
        e,
        SOLANA_ERROR__TRANSACTION__NONCE_ACCOUNT_CANNOT_BE_IN_LOOKUP_TABLE,
      )
    ) {
      return undefined;
    }
    throw e;
  }
  if ('blockhash' in lifetimeConstraint && lastValidBlockHeight != null) {
    return {...lifetimeConstraint, lastValidBlockHeight};
  }
  return lifetimeConstraint;
}

/**
 * Sign the serialized transaction bytes,
 * delegating to Kit's `partiallySignTransactionWithSigners`
 *
 * @internal
 */
export async function signTransactionMessageBytes(
  signers: readonly Signer[],
  messageBytes: Uint8Array,
  requiredSignerPublicKeys: readonly PublicKey[],
  signatures: readonly SignaturePair[],
  lifetimeConstraint:
    | TransactionBlockhashLifetime
    | TransactionDurableNonceLifetime
    | undefined,
): Promise<KitTransaction> {
  for (const signer of signers) {
    assertIsTransactionPartialSigner(signer);
  }
  const transaction = {
    ...(lifetimeConstraint != null ? {lifetimeConstraint} : null),
    messageBytes: asTransactionMessageBytes(toPackedUint8Array(messageBytes)),
    signatures: buildSignatureMap(requiredSignerPublicKeys, signatures),
  } satisfies KitTransaction;
  return await partiallySignTransactionWithSigners(signers, transaction);
}

function buildSignatureMap(
  requiredSignerPublicKeys: readonly PublicKey[],
  signatures: readonly SignaturePair[],
): SignaturesMap {
  const signatureMap: SignaturesMap = {};
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
