// @flow

import {
  Account,
  BudgetProgram,
  Connection,
  SystemProgram,
  Transaction,
} from '../src';
import {mockRpcEnabled} from './__mocks__/node-fetch';
import {url} from './url';
import {newAccountWithTokens} from './new-account-with-tokens';

test('createAccount', () => {
  const from = new Account();
  const newAccount = new Account();
  let transaction;

  transaction = SystemProgram.createAccount(
    from.publicKey,
    newAccount.publicKey,
    123,
    BudgetProgram.space,
    BudgetProgram.programId,
  );

  expect(transaction.keys).toHaveLength(2);
  expect(transaction.programId).toEqual(SystemProgram.programId);
  // TODO: Validate transaction contents more
});

test('move', () => {
  const from = new Account();
  const to = new Account();
  let transaction;

  transaction = SystemProgram.move(
    from.publicKey,
    to.publicKey,
    123,
  );

  expect(transaction.keys).toHaveLength(2);
  expect(transaction.programId).toEqual(SystemProgram.programId);
  // TODO: Validate transaction contents more
});


test('assign', () => {
  const from = new Account();
  const to = new Account();
  let transaction;

  transaction = SystemProgram.assign(
    from.publicKey,
    to.publicKey,
  );

  expect(transaction.keys).toHaveLength(1);
  expect(transaction.programId).toEqual(SystemProgram.programId);
  // TODO: Validate transaction contents more
});

test('unstable - load noop', async () => {
  if (mockRpcEnabled) {
    console.log('non-live test skipped');
    return;
  }

  const connection = new Connection(url);
  const from = await newAccountWithTokens(connection);
  const noopProgramId = (new Account()).publicKey;

  const loadTransaction = SystemProgram.load(
    from.publicKey,
    noopProgramId,
    'noop',
  );

  let signature = await connection.sendTransaction(from, loadTransaction);
  expect(connection.confirmTransaction(signature)).resolves.toBe(true);

  const noopTransaction = new Transaction({
    fee: 0,
    keys: [from.publicKey],
    programId: noopProgramId,
  });
  signature = await connection.sendTransaction(from, noopTransaction);
  expect(connection.confirmTransaction(signature)).resolves.toBe(true);


});

test('unstable - load solua', async () => {
  if (mockRpcEnabled) {
    console.log('non-live test skipped');
    return;
  }

  const connection = new Connection(url);
  const from = await newAccountWithTokens(connection, 10);
  const to = await newAccountWithTokens(connection, 10);

  const soluaProgramId = (new Account()).publicKey;

  const loadTransaction = SystemProgram.load(
    from.publicKey,
    soluaProgramId,
    'solua',
  );
  let signature = await connection.sendTransaction(from, loadTransaction);
  expect(connection.confirmTransaction(signature)).resolves.toBe(true);

  const assignTransaction = SystemProgram.assign(from.publicKey, soluaProgramId);
  signature = await connection.sendTransaction(from, assignTransaction);
  expect(connection.confirmTransaction(signature)).resolves.toBe(true);

  /*
   *
   * TODO: Need to load `luaProgram` into the userdata of an account.  It cannot
   * run from the userdata of a `Transaction` as it attempted below
   *
   */
  const luaProgram = `
      accounts[0].tokens -= 1
      accounts[1].tokens += 1
  `;

  const soluaTransaction = new Transaction({
    fee: 0,
    keys: [from.publicKey, to.publicKey],
    programId: soluaProgramId,
    userdata: Buffer.from(luaProgram),
  });
  signature = await connection.sendTransaction(from, soluaTransaction);
  expect(connection.confirmTransaction(signature)).resolves.toBe(true);

  let balance = await connection.getBalance(from.publicKey);
  expect(balance).toBe(9);
  balance = await connection.getBalance(to.publicKey);
  expect(balance).toBe(10);

});

