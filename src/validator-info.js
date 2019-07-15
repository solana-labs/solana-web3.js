// @flow

import * as BufferLayout from 'buffer-layout';
import * as Layout from './layout';
import {PublicKey} from './publickey';
import {Account} from './account';
import * as shortvec from './util/shortvec-encoding';
import {struct} from 'superstruct';

const VALIDATOR_INFO_KEY = new PublicKey('Va1idator1nfo111111111111111111111111111111');

/**
 * @private
 */
type ConfigKey = {|
  publicKey: PublicKey,
  isSigner: boolean,
|};

/**
 * @private
 */
type Info = {|
  name: string,
  website?: string,
  details?: string,
  keybaseId?: string,
|};

const InfoString = struct({
  name: 'string',
  website: 'string?',
  details: 'string?',
  keybaseId: 'string?',
});

/**
 * ValidatorInfo class
 */
export class ValidatorInfo {
  key: PublicKey;
  info: Info;

  /**
   * Construct a valid ValidatorInfo
   */
  constructor(key: PublicKey, info: Info) {
    this.key = key;
    this.info = info;
  }

  /**
   * Deserialize ValidatorInfo from the config account data.
   *
   * @return ValidatorInfo or null if info was not found
   */
  static fromConfigData(buffer: Buffer): ?ValidatorInfo {
    const PUBKEY_LENGTH = 32;

    let byteArray = [...buffer];
    const configKeyCount = shortvec.decodeLength(byteArray);
    if (configKeyCount < 2) return null;

    const configKeys: Array<ConfigKey> = [];
    for (let i = 0; i < 2; i++) {
      const publicKey = new PublicKey(byteArray.slice(0, PUBKEY_LENGTH));
      byteArray = byteArray.slice(PUBKEY_LENGTH);
      const isSigner = byteArray.slice(0, 1)[0] === 1;
      byteArray = byteArray.slice(1);
      configKeys.push({publicKey, isSigner});
    }

    if (configKeys[0].publicKey.equals(VALIDATOR_INFO_KEY)) {
      if (configKeys[1].isSigner) {
        const rawInfo = Layout.rustString().decode(Buffer.from(byteArray));
        const info = InfoString(JSON.parse(rawInfo));
        return new ValidatorInfo(configKeys[1].publicKey, info);
      }
    }

    return null;
  }
}
