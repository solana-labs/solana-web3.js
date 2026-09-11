'use client';

import {useConnection, useWallet} from '@solana/wallet-adapter';
import type {TransactionSignature} from '@solana/web3.js';
import {
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import {ActionButton} from './ActionButton';
import {MEMO_TEXT, MEMO_V1_PROGRAM_ID} from './memo';
import {useNotify} from './Notifications';
import {supportsTransactionVersion} from './transactionVersion';

const DEVNET_LOOKUP_TABLE = new PublicKey(
  'F3MfgEJe1TApJiA14nN2m4uAH4EBVrqdBnHeGeSXvQ7B',
);

export function SendV0Transaction() {
  const {connection} = useConnection();
  const {publicKey, sendTransaction, supportedTransactionVersions} =
    useWallet();
  const notify = useNotify();
  const supported = supportsTransactionVersion(supportedTransactionVersions, 0);

  const onClick = async () => {
    let signature: TransactionSignature | undefined;
    try {
      if (!publicKey) throw new Error('Wallet not connected!');
      if (!supported)
        throw new Error("Wallet doesn't support v0 transactions!");

      const {value: lookupTable} =
        await connection.getAddressLookupTable(DEVNET_LOOKUP_TABLE);
      if (!lookupTable) throw new Error("Address lookup table wasn't found!");

      const {
        context: {slot: minContextSlot},
        value: {blockhash, lastValidBlockHeight},
      } = await connection.getLatestBlockhashAndContext();

      const message = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: blockhash,
        instructions: [
          new TransactionInstruction({
            data: new TextEncoder().encode(MEMO_TEXT),
            keys: lookupTable.state.addresses.map((pubkey, index) => ({
              pubkey,
              isWritable: index % 2 === 0,
              isSigner: false,
            })),
            programId: MEMO_V1_PROGRAM_ID,
          }),
        ],
      });
      const transaction = new VersionedTransaction(
        message.compileToV0Message([lookupTable]),
      );

      signature = await sendTransaction(transaction, connection, {
        minContextSlot,
      });
      notify('info', 'Transaction sent:', signature);

      await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature,
      });
      notify('success', 'Transaction successful!', signature);
    } catch (error) {
      notify(
        'error',
        `Transaction failed! ${(error as Error).message}`,
        signature,
      );
    }
  };

  return (
    <ActionButton
      onClick={onClick}
      disabled={!publicKey}
      unsupported={!!publicKey && !supported}
    >
      Send V0 Transaction (devnet)
    </ActionButton>
  );
}
