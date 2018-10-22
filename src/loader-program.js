// @flow

import * as BufferLayout from 'buffer-layout';

import { Transaction } from './transaction';
import { PublicKey } from './publickey';

/**
 * Factory class for transactions to interact with the Loader programs
 */
export class LoaderProgram {

  /**
   * Generate a Transaction that creates writes to an account
   */
  static write(
    loader: PublicKey,
    offset: number,
    bytes: Buffer,
    fee: number
  ): Transaction {

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
        offset,
        bytesLength: bytes.length,
        bytes,
      },
      userdata,
    );

    return new Transaction({
      fee: fee,
      keys: [],
      programId: loader,
      userdata,
    });
  }

  static finalize(
    loader: PublicKey,
    fee: number
  ): Transaction {

    const userdataLayout = BufferLayout.struct([
      BufferLayout.u32('instruction'),
    ]);

    const userdata = Buffer.alloc(userdataLayout.span);
    userdataLayout.encode(
      {
        instruction: 1, // Finalize instruction
      },
      userdata,
    );

    return new Transaction({
      fee: fee,
      keys: [],
      programId: loader,
      userdata,
    });
  }
}
