import { Base58EncodedAddress } from '@solana/addresses';
import { pipe } from '@solana/functional';
import { createTransaction, ITransactionWithFeePayer, setTransactionFeePayer, Transaction } from '@solana/transactions';
import { AddressLookupTableAccount, MessageAccountKeys, VersionedTransaction } from '@solana/web3.js';

export function fromOldVersionedTransaction(
    transaction: VersionedTransaction,
    addressLookupTableAccounts?: AddressLookupTableAccount[]
): Transaction & ITransactionWithFeePayer {
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

    // TODO: lifetime constraint

    // TODO: instructions

    // TODO: signatures?

    return pipe(createTransaction({ version: transaction.version }), tx =>
        setTransactionFeePayer(feePayer.toBase58() as Base58EncodedAddress, tx)
    );
}
