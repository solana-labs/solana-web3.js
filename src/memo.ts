import {UTF8} from '@solana/buffer-layout';

import {TransactionInstruction} from './transaction';
import {PublicKey} from './publickey';

export const MEMO_CONFIG = new PublicKey(
  'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
);

// Adding these functions https://docs.rs/spl-memo/latest/spl_memo/fn.build_memo.html

/**
 *  Initialize build memo params
 */

export type BuildMemoParams = {
  // requires a valid u8 input
  memo: String;
  // requires  an array of public keys
  signer_public_keys?: PublicKey[];
};

export class MemoProgram {
  constructor() {}

  static programId: PublicKey = new PublicKey(
    'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
  );

  // Returns the public key of program id
  static id(): PublicKey {
    return MemoProgram.programId;
  }

  // Checks whether the given public key is same as the program id
  static checkId(programId: PublicKey): boolean {
    if (!programId.equals(MemoProgram.programId)) {
      throw new Error('invalid instruction; programId is not MemoProgram');
    } else {
      return true;
    }
  }

  static buildMemo(params: BuildMemoParams): TransactionInstruction {
    const {memo, signer_public_keys} = params;

    let data = Buffer.from(memo);
    let keys = [];
    if (signer_public_keys) {
      for (const key of signer_public_keys) {
        keys.push({pubkey: key, isSigner: true, isWritable: true});
      }
    }

    return new TransactionInstruction({
      keys: keys,
      programId: MemoProgram.id(),
      data,
    });
  }
}
