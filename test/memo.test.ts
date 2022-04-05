import {expect} from 'chai';
import {Buffer} from 'buffer';

import {MemoProgram} from '../src/memo';
import { TransactionInstruction } from '../src/transaction';
import { Keypair } from '../src/keypair';
import { PublicKey } from '../src/publickey';

describe('Memo Tests', () => {
  it('Return programId', () => {
    const programId = MemoProgram.id();
    
    expect(programId.toString()).to.eq('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
  });

  it('Check ProgramId Failure', () => {
    const newKey = new PublicKey('11111111111111111111111111111111')
    const idCheck = MemoProgram.checkId(newKey);

    expect(idCheck).to.eq(false);
  });

  it('Check ProgramId Success', () => {
    const newKey = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr')
    const idCheck = MemoProgram.checkId(newKey);

    expect(idCheck).to.eq(true);
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
});
