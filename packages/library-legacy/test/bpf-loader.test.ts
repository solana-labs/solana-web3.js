import fs from 'mz/fs';
import {expect, use} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {fail} from 'assert';

import {
  Connection,
  BpfLoader,
  Transaction,
  sendAndConfirmTransaction,
  Keypair,
  MessageV0,
  TransactionInstruction,
  VersionedTransaction,
} from '../src';
import {url} from './url';
import {BPF_LOADER_PROGRAM_ID} from '../src/bpf-loader';
import {helpers} from './mocks/rpc-http';

use(chaiAsPromised);

if (process.env.TEST_LIVE) {
  describe('BPF Loader', () => {
    describe('load BPF program', () => {
      const connection = new Connection(url, 'confirmed');

      let program = Keypair.generate();
      let payerAccount = Keypair.generate();
      let programData: Buffer;

      before(async function () {
        this.timeout(60_000);

        const [
          _0, // eslint-disable-line @typescript-eslint/no-unused-vars
          {feeCalculator},
          payerBalance,
        ] = await Promise.all([
          (async () => {
            programData = await fs.readFile(
              'test/fixtures/noop-program/solana_sbf_rust_noop.so',
            );
          })(),
          connection.getRecentBlockhash(),
          connection.getMinimumBalanceForRentExemption(0),
        ]);

        const fees =
          feeCalculator.lamportsPerSignature *
          BpfLoader.getMinNumSignatures(programData.length);

        // First load will fail part way due to lack of funds
        const insufficientPayerAccount = Keypair.generate();

        const [
          _1, // eslint-disable-line @typescript-eslint/no-unused-vars
          executableBalance,
        ] = await Promise.all([
          helpers.airdrop({
            connection,
            address: insufficientPayerAccount.publicKey,
            amount: 2 * feeCalculator.lamportsPerSignature * 8,
          }),
          connection.getMinimumBalanceForRentExemption(programData.length),
        ]);

        await Promise.all([
          helpers.airdrop({
            connection,
            address: payerAccount.publicKey,
            amount: payerBalance + fees + executableBalance,
          }),
          // Create program account with low balance
          helpers.airdrop({
            connection,
            address: program.publicKey,
            amount: executableBalance - 1,
          }),
        ]);

        const failedLoadPromise = BpfLoader.load(
          connection,
          insufficientPayerAccount,
          program,
          programData,
          BPF_LOADER_PROGRAM_ID,
        );
        // Second load will succeed
        const successfulLoadPromise = BpfLoader.load(
          connection,
          payerAccount,
          program,
          programData,
          BPF_LOADER_PROGRAM_ID,
        );
        await expect(failedLoadPromise).to.be.rejected;
        await expect(successfulLoadPromise).not.to.be.rejected;
      });

      it('get confirmed transaction', async () => {
        const transaction = new Transaction().add({
          keys: [
            {
              pubkey: payerAccount.publicKey,
              isSigner: true,
              isWritable: true,
            },
          ],
          programId: program.publicKey,
        });

        const signature = await sendAndConfirmTransaction(
          connection,
          transaction,
          [payerAccount],
          {
            preflightCommitment: connection.commitment || 'finalized',
          },
        );

        const parsedTx = await connection.getParsedTransaction(signature);
        if (parsedTx === null) {
          expect(parsedTx).not.to.be.null;
          return;
        }
        const {signatures, message} = parsedTx.transaction;
        expect(signatures[0]).to.eq(signature);
        const ix = message.instructions[0];
        if ('parsed' in ix) {
          expect('parsed' in ix).to.eq(false);
        } else {
          expect(ix.programId).to.eql(program.publicKey);
          expect(ix.data).to.eq('');
        }
      }).timeout(30000);

      it('simulate transaction', async () => {
        const simulatedTransaction = new VersionedTransaction(
          MessageV0.compile({
            instructions: [
              new TransactionInstruction({
                keys: [
                  {
                    pubkey: payerAccount.publicKey,
                    isSigner: true,
                    isWritable: true,
                  },
                ],
                programId: program.publicKey,
              }),
            ],
            payerKey: payerAccount.publicKey,
            recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
          }),
        );
        simulatedTransaction.sign([payerAccount]);

        const {err, logs} = (
          await connection.simulateTransaction(simulatedTransaction, {
            sigVerify: true,
          })
        ).value;
        expect(err).to.be.null;

        if (logs === null) {
          expect(logs).not.to.be.null;
          return;
        }

        expect(logs.length).to.be.at.least(2);
        expect(logs[0]).to.eq(
          `Program ${program.publicKey.toBase58()} invoke [1]`,
        );
        expect(logs[logs.length - 1]).to.eq(
          `Program ${program.publicKey.toBase58()} success`,
        );
      });

      it('simulate transaction with returnData', async () => {
        const simulatedTransaction = new VersionedTransaction(
          MessageV0.compile({
            instructions: [
              new TransactionInstruction({
                keys: [
                  {
                    pubkey: payerAccount.publicKey,
                    isSigner: true,
                    isWritable: true,
                  },
                ],
                programId: program.publicKey,
              }),
            ],
            payerKey: payerAccount.publicKey,
            recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
          }),
        );
        simulatedTransaction.sign([payerAccount]);

        const {err, returnData} = (
          await connection.simulateTransaction(simulatedTransaction, {
            sigVerify: true,
          })
        ).value;
        const expectedReturnData = new Uint8Array([1, 2, 3]);

        if (returnData) {
          var decodedData = Buffer.from(returnData.data[0], returnData.data[1]);
          expect(err).to.be.null;
          expect(returnData.programId).to.eql(program.publicKey.toString());
          expect(decodedData).to.eql(expectedReturnData);
        } else {
          fail('return data must be defined!');
        }
      });

      it('simulate transaction without signature verification', async () => {
        const simulatedTransaction = new VersionedTransaction(
          MessageV0.compile({
            instructions: [
              new TransactionInstruction({
                keys: [
                  {
                    pubkey: payerAccount.publicKey,
                    isSigner: true,
                    isWritable: true,
                  },
                ],
                programId: program.publicKey,
              }),
            ],
            payerKey: payerAccount.publicKey,
            recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
          }),
        );

        const {err, logs} = (
          await connection.simulateTransaction(simulatedTransaction, {
            sigVerify: false,
          })
        ).value;
        expect(err).to.be.null;

        if (logs === null) {
          expect(logs).not.to.be.null;
          return;
        }

        expect(logs.length).to.be.at.least(2);
        expect(logs[0]).to.eq(
          `Program ${program.publicKey.toBase58()} invoke [1]`,
        );
        expect(logs[logs.length - 1]).to.eq(
          `Program ${program.publicKey.toBase58()} success`,
        );
      });

      it('simulate transaction with bad programId', async () => {
        const simulatedTransaction = new VersionedTransaction(
          MessageV0.compile({
            instructions: [
              new TransactionInstruction({
                keys: [
                  {
                    pubkey: payerAccount.publicKey,
                    isSigner: true,
                    isWritable: true,
                  },
                ],
                programId: Keypair.generate().publicKey,
              }),
            ],
            payerKey: payerAccount.publicKey,
            recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
          }),
        );

        const {err, logs} = (
          await connection.simulateTransaction(simulatedTransaction)
        ).value;
        expect(err).to.eq('ProgramAccountNotFound');

        if (logs === null) {
          expect(logs).not.to.be.null;
          return;
        }

        expect(logs).to.have.length(0);
      });

      it('reload program', async () => {
        await expect(
          BpfLoader.load(
            connection,
            payerAccount,
            program,
            programData,
            BPF_LOADER_PROGRAM_ID,
          ),
        ).to.eventually.be.false;
      });
    });
  });
}
