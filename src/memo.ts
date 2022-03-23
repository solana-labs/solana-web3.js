import {PublicKey} from './publickey';

export const MEMO_CONFIG = new PublicKey(
  'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
);

// Adding these functions https://docs.rs/spl-memo/latest/spl_memo/fn.build_memo.html

/**
 *  Initialize build memo params
 */

export type BuildMemoParams = {
  // requires a valid u8 input string
  memo: string;
  // requires  an array of public keys
  signer_public_keys: PublicKey[];
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
  static checkId(id: PublicKey): boolean {
    return MemoProgram.id().equals(id);
  }

  // static buildMemo(params: BuildMemoParams):
}
