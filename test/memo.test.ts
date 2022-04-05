import {expect} from 'chai';
import {Buffer} from 'buffer';

import {MemoProgram} from '../src/memo';
import { TransactionInstruction } from '../src/transaction';
import { Keypair } from '../src/keypair';
import { PublicKey } from '../src/publickey';

describe('Account', () => {
  it('Return programId', () => {
    const programId = MemoProgram.id();
    
    expect(programId.toString()).to.eq('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
  });

  it('Check ProgramId', () => {
    const newKey = new PublicKey('11111111111111111111111111111111')
    const idCheck = MemoProgram.checkId(newKey);

    expect(idCheck).to.eq(false);
  });

  it('build memo', () => {
    const sampleMemo = MemoProgram.buildMemo({memo: "This is a sample memo"});

    const resultTransaction = new TransactionInstruction({
      data: Buffer.from("This is a sample memo"),
      keys: [],
      programId: MemoProgram.programId
    });

    expect(sampleMemo.data.toString()).to.eq(resultTransaction.data.toString());
  });

//   it('account from secret key', () => {
//     const secretKey = Buffer.from([
//       153, 218, 149, 89, 225, 94, 145, 62, 233, 171, 46, 83, 227, 223, 173, 87,
//       93, 163, 59, 73, 190, 17, 37, 187, 146, 46, 51, 73, 79, 73, 136, 40, 27,
//       47, 73, 9, 110, 62, 93, 189, 15, 207, 169, 192, 192, 205, 146, 217, 171,
//       59, 33, 84, 75, 52, 213, 221, 74, 101, 217, 139, 135, 139, 153, 34,
//     ]);
//     const account = new Account(secretKey);
//     expect(account.publicKey.toBase58()).to.eq(
//       '2q7pyhPwAwZ3QMfZrnAbDhnh9mDUqycszcpf86VgQxhF',
//     );
//   });
});
