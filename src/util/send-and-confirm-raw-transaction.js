// @flow

import {Connection} from '../connection';
import type {Commitment} from '../connection';
import {sleep} from './sleep';
import type {TransactionSignature} from '../transaction';
import {DEFAULT_TICKS_PER_SLOT, NUM_TICKS_PER_SECOND} from '../timing';

const NUM_STATUS_RETRIES = 10;

/**
 * Sign, send and confirm a raw transaction
 */
export async function sendAndConfirmRawTransaction(
  connection: Connection,
  rawTransaction: Buffer,
  commitment: ?Commitment,
): Promise<TransactionSignature> {
  const start = Date.now();
  const statusCommitment = commitment || connection.commitment || 'max';
  let signature = await connection.sendRawTransaction(rawTransaction);

  // Wait up to a couple slots for a confirmation
  let status = null;
  let statusRetries = NUM_STATUS_RETRIES;
  for (;;) {
    status = (await connection.getSignatureStatus(signature)).value;
    if (status) {
      statusRetries = NUM_STATUS_RETRIES;
      if (
        status.confirmations === null ||
        (status.confirmations > 0 &&
          (statusCommitment === 'recent' || statusCommitment === 'single'))
      )
        break;
    }

    // Sleep for approximately half a slot
    await sleep((500 * DEFAULT_TICKS_PER_SLOT) / NUM_TICKS_PER_SECOND);

    if (--statusRetries <= 0) {
      const duration = (Date.now() - start) / 1000;
      throw new Error(
        `Raw Transaction '${signature}' was not confirmed in ${duration.toFixed(
          2,
        )} seconds (${JSON.stringify(status)})`,
      );
    }
  }

  if (status && !status.err) {
    return signature;
  }

  throw new Error(
    `Raw transaction ${signature} failed (${JSON.stringify(status)})`,
  );
}
