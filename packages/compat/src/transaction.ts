import { Base58EncodedAddress } from '@solana/addresses';
import { pipe } from '@solana/functional';
import {
    Blockhash,
    createTransaction,
    ITransactionWithBlockhashLifetime,
    ITransactionWithFeePayer,
    setTransactionFeePayer,
    setTransactionLifetimeUsingBlockhash,
    Transaction,
} from '@solana/transactions';
import { AddressLookupTableAccount, MessageAccountKeys, VersionedTransaction } from '@solana/web3.js';

export function fromOldVersionedTransactionWithBlockhash(
    transaction: VersionedTransaction,
    lastValidBlockHeight: bigint,
    addressLookupTableAccounts?: AddressLookupTableAccount[]
): Transaction & ITransactionWithFeePayer & ITransactionWithBlockhashLifetime {
    let accountKeys: MessageAccountKeys;
    // eslint-disable-next-line no-useless-catch
    try {
        accountKeys = transaction.message.getAccountKeys({ addressLookupTableAccounts });
    } catch (e) {
        // TODO: coded error, don't just throw the legacy one
        throw e;
    }

    // Fee payer is first account
    const feePayer = accountKeys.staticAccountKeys[0];
    // TODO: coded error
    if (!feePayer) throw new Error('No fee payer set in VersionedTransaction');

    // TODO: instructions

    // TODO: signatures?

    return pipe(
        createTransaction({ version: transaction.version }),
        tx => setTransactionFeePayer(feePayer.toBase58() as Base58EncodedAddress, tx),
        tx =>
            setTransactionLifetimeUsingBlockhash(
                {
                    blockhash: transaction.message.recentBlockhash as Blockhash,
                    lastValidBlockHeight,
                },
                tx
            )
    );
}
