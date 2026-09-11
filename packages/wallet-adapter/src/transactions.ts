import type {Transaction as KitTransaction} from '@solana/kit';
import {bytesEqual, getTransactionCodec} from '@solana/kit';
import {
  SystemInstruction,
  SystemProgram,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js';

const transactionCodec = getTransactionCodec();
type SignKitTransactions = (
  transactions: readonly KitTransaction[],
) => Promise<readonly KitTransaction[]>;

/** `true` when the transaction is a `VersionedTransaction` rather than a legacy `Transaction`. */
export function isVersionedTransaction(
  transaction: Transaction | VersionedTransaction,
): transaction is VersionedTransaction {
  return 'version' in transaction;
}

/** The wire bytes of a `@solana/web3.js` transaction, signed or not. */
export function serializeTransaction(
  transaction: Transaction | VersionedTransaction,
): Promise<Uint8Array> {
  return isVersionedTransaction(transaction)
    ? Promise.resolve(transaction.serialize())
    : transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });
}

/** A wallet may switch a blockhash lifetime to a durable nonce, making the block-height expiry meaningless. */
function advancesNonce(
  instruction: Transaction['instructions'][number] | undefined,
): boolean {
  return (
    instruction !== undefined &&
    instruction.programId.equals(SystemProgram.programId) &&
    SystemInstruction.decodeInstructionType(instruction) ===
      'AdvanceNonceAccount'
  );
}

/** Sign `@solana/web3.js` transactions, returning new transactions of the same class as the inputs. */
export async function signTransactionsWithKit<
  T extends Transaction | VersionedTransaction,
>(sign: SignKitTransactions, transactions: readonly T[]): Promise<T[]> {
  const wireBytes = await Promise.all(transactions.map(serializeTransaction));
  const signed = await sign(
    wireBytes.map(bytes => transactionCodec.decode(bytes)),
  );
  // Kit's signer maps outputs by position and never checks their count.
  if (signed.length !== transactions.length)
    throw new Error('Expected one signed transaction per input.');
  return transactions.map((transaction, i) => {
    const bytes = transactionCodec.encode(signed[i]!) as Uint8Array;
    if (isVersionedTransaction(transaction))
      return VersionedTransaction.deserialize(bytes) as T;
    const result = Transaction.from(bytes);
    // Wire bytes carry no client-side lifetime bookkeeping; keep it while the lifetime is unchanged.
    if (transaction.nonceInfo) {
      const {nonce, nonceInstruction} = transaction.nonceInfo;
      const first = result.instructions[0];
      if (
        result.recentBlockhash === nonce &&
        first?.programId.equals(nonceInstruction.programId) &&
        bytesEqual(first.data, nonceInstruction.data) &&
        first.keys[0]?.pubkey.equals(nonceInstruction.keys[0]!.pubkey)
      ) {
        result.nonceInfo = {nonce, nonceInstruction: first};
        result.minNonceContextSlot = transaction.minNonceContextSlot;
      }
    } else if (
      result.recentBlockhash === transaction.recentBlockhash &&
      !advancesNonce(result.instructions[0])
    ) {
      result.lastValidBlockHeight = transaction.lastValidBlockHeight;
    }
    return result as T;
  });
}
