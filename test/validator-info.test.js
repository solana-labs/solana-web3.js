// @flow
import nacl from 'tweetnacl';

import {PublicKey} from '../src/publickey';
import {ValidatorInfo} from '../src/validator-info';

test('from config account data', () => {
  const keypair = nacl.sign.keyPair.fromSeed(
    Uint8Array.from(Array(32).fill(8)),
  );

  const expectedValidatorInfo = new ValidatorInfo(
    new PublicKey(keypair.publicKey),
    {
      name: 'Validator',
      keybaseId: 'validator_id',
    },
  );

  const configData = Buffer.from(
    'AgdRlwF0SPKsXcI8nrx6x4wKJyV6xhRFjeCk8W+AAAAAABOY9ixtGkV8UbpqS189vS9p/KkyFiGNyJl+QWvRfZPKAS8AAAAAAAAAeyJrZXliYXNlSWQiOiJ2YWxpZGF0b3JfaWQiLCJuYW1lIjoiVmFsaWRhdG9yIn0',
    'base64',
  );
  const info = ValidatorInfo.fromConfigData(configData);

  expect(info).toEqual(expectedValidatorInfo);
});
