// @flow

import fs from 'mz/fs';

import {Connection, BpfLoader, Loader} from '../src';
import {mockRpcEnabled} from './__mocks__/node-fetch';
import {url} from './url';
import {newAccountWithLamports} from './new-account-with-lamports';
import {sendAndConfirmTransaction} from '../src/util/send-and-confirm-transaction';
import {Transaction} from '../src/transaction';

if (!mockRpcEnabled) {
  // The default of 5 seconds is too slow for live testing sometimes
  jest.setTimeout(120000);
}

const NUM_RETRIES = 100; /* allow some number of retries */

test('load BPF C program', async () => {
  if (mockRpcEnabled) {
    console.log('non-live test skipped');
    return;
  }

  const data = await fs.readFile('test/fixtures/noop-c/noop.so');
  const connection = new Connection(url);
  const [, feeCalculator] = await connection.getRecentBlockhash();
  const fees =
    feeCalculator.lamportsPerSignature *
    (BpfLoader.getMinNumSignatures(data.length) + NUM_RETRIES + 1);
  const payer = await newAccountWithLamports(connection, fees);
  const programId = await BpfLoader.load(connection, payer, data);
  const program_data = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]);

  const transaction = new Transaction().add(
    Loader.invokeMainInstruction({
      keys: [{pubkey: payer.publicKey, isSigner: true, isDebitable: true}],
      programId,
      data: program_data,
    }),
  );
  return await sendAndConfirmTransaction(connection, transaction, payer);
});

test('load BPF Rust program', async () => {
  if (mockRpcEnabled) {
    console.log('non-live test skipped');
    return;
  }

  const data = await fs.readFile(
    'test/fixtures/noop-rust/solana_bpf_rust_noop.so',
  );
  const connection = new Connection(url);
  const [, feeCalculator] = await connection.getRecentBlockhash();
  const fees =
    feeCalculator.lamportsPerSignature *
    (BpfLoader.getMinNumSignatures(data.length) + NUM_RETRIES + 1);
  const payer = await newAccountWithLamports(connection, fees);
  const programId = await BpfLoader.load(connection, payer, data);
  const program_data = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]);

  const transaction = new Transaction().add(
    Loader.invokeMainInstruction({
      keys: [{pubkey: payer.publicKey, isSigner: true, isDebitable: true}],
      programId,
      data: program_data,
    }),
  );
  return await sendAndConfirmTransaction(connection, transaction, payer);
});
