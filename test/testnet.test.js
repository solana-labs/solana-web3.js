// @flow
import {testnetChannelEndpoint} from '../src/util/testnet';

test('invalid', () => {
  expect(() => {
    testnetChannelEndpoint('abc123');
  }).toThrow();
});

test('stable', () => {
  expect(testnetChannelEndpoint('stable')).toEqual(
    'https://testnet.solana.com:8443',
  );

  expect(testnetChannelEndpoint('stable', true)).toEqual(
    'https://testnet.solana.com:8443',
  );

  expect(testnetChannelEndpoint('stable', false)).toEqual(
    'http://testnet.solana.com:8899',
  );
});

test('default', () => {
  testnetChannelEndpoint(); // Should not throw
});
