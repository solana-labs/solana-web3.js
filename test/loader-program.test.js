// @flow

import * as BufferLayout from 'buffer-layout';

import {Account, LoaderProgram} from '../src';

test('Write', () => {
  const loader = new Account();
  let transaction;

  const bytes = Buffer.alloc(100, 5);

  transaction = LoaderProgram.write(
    loader.publicKey,
    0,
    bytes,
    0,
  );

  const userdataLayout = BufferLayout.struct([
    BufferLayout.u32('instruction'),
    BufferLayout.u32('offset'),
    BufferLayout.ns64('bytesLength'),
    BufferLayout.blob(bytes.length, 'bytes'),
  ]);

  const userdata = Buffer.alloc(userdataLayout.span);
  userdataLayout.encode(
    {
      instruction: 0, // Write instruction
      offset:  0,
      bytesLength: bytes.length,
      bytes,
    },
    userdata,
  );

  expect(transaction.keys).toHaveLength(0);
  expect(transaction.programId).toEqual(loader.publicKey);
  expect(transaction.userdata).toEqual(userdata);
});

test('Finalize', () => {
  const loader = new Account();
  let transaction;

  transaction = LoaderProgram.finalize(
    loader.publicKey,
    0,
  );

  const userdataLayout = BufferLayout.struct([
    BufferLayout.u32('instruction'),
  ]);

  const userdata = Buffer.alloc(userdataLayout.span);
  userdataLayout.encode(
    {
      instruction: 1, // Write instruction
    },
    userdata,
  );

  expect(transaction.keys).toHaveLength(0);
  expect(transaction.programId).toEqual(loader.publicKey);
  expect(transaction.userdata).toEqual(userdata);
});
