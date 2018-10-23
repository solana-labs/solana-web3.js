// @flow

import * as fs from 'file-system';
import * as elfy from 'elfy';

import { Account, PublicKey, Loader, SystemProgram } from '.';
import { sendAndConfirmTransaction } from './util/send-and-confirm-transaction';
import type { Connection } from '.';

/**
 * Factory class for transactions to interact with a program loader
 */
export class BpfLoader {
  /**
   * Public key that identifies the NativeLoader
   */
  static get programId(): PublicKey {
    return new PublicKey('0x0606060606060606060606060606060606060606060606060606060606060606');
  }

  // static parse(programName: string) {

  //   var file = fs.readFileSync(programName);
  //   var elf = elfy.parse(file);
  //   var section = elf.body.sections.find(function (sect) {
  //     return sect.name == '.text.entrypoint';
  //   });
  //   // console.log('cwd: ' + process.cwd());
  //   // console.log('elf: ' + JSON.stringify(elf));
  //   console.log('section: ' + JSON.stringify(section.data));
  // }

  /**
   * Loads a BPF program
   *
   * @param connection The connection to use
   * @param owner User account to load the program with
   * @param programName Name of the BPF program
   */
  static async load(
    connection: Connection,
    owner: Account,
    programName: string,
  ): Promise<PublicKey> {
    const programAccount = new Account();

    var file = fs.readFileSync(programName);
    var elf = elfy.parse(file);
    var section = elf.body.sections.find(function (sect) {
      return sect.name == '.text.entrypoint';
    });
    // console.log('cwd: ' + process.cwd());
    // console.log('elf: ' + JSON.stringify(elf));
    // console.log('section: ' + JSON.stringify(section.data));

    // Allocate memory for the program account
    const transaction = SystemProgram.createAccount(
      owner.publicKey,
      programAccount.publicKey,
      1,
      section.data.length + 1,
      BpfLoader.programId,
    );
    await sendAndConfirmTransaction(connection, owner, transaction);

    const loader = new Loader(connection, BpfLoader.programId);
    await loader.load(programAccount, 0, section.data);
    await loader.finalize(programAccount);

    return programAccount.publicKey;
  }
}
