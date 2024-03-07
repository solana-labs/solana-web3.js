import { AccountRole, IAccountLookupMeta, IAccountMeta, IInstruction } from '@solana/instructions';
import { BaseTransaction, TransactionVersion } from '@solana/transactions';

import { deduplicateSigners } from './deduplicate-signers';
import { TransactionSigner } from './transaction-signer';

/** An extension of the IAccountMeta type that keeps track of its transaction signer. */
export interface IAccountSignerMeta<
    TAddress extends string = string,
    TSigner extends TransactionSigner<TAddress> = TransactionSigner<TAddress>,
> extends IAccountMeta<TAddress> {
    readonly role: AccountRole.READONLY_SIGNER | AccountRole.WRITABLE_SIGNER;
    readonly signer: TSigner;
}

type IAccountMetaWithSigner<TSigner extends TransactionSigner = TransactionSigner> =
    | IAccountLookupMeta
    | IAccountMeta
    | IAccountSignerMeta<string, TSigner>;

/** A variation of the instruction type that allows IAccountSignerMeta in its account metas. */
export type IInstructionWithSigners<
    TSigner extends TransactionSigner = TransactionSigner,
    TAccounts extends readonly IAccountMetaWithSigner<TSigner>[] = readonly IAccountMetaWithSigner<TSigner>[],
> = Pick<IInstruction<string, TAccounts>, 'accounts'>;

/** A variation of the transaction type that allows IAccountSignerMeta in its account metas. */
export type ITransactionWithSigners<
    TSigner extends TransactionSigner = TransactionSigner,
    TAccounts extends readonly IAccountMetaWithSigner<TSigner>[] = readonly IAccountMetaWithSigner<TSigner>[],
> = Pick<
    BaseTransaction<TransactionVersion, IInstruction & IInstructionWithSigners<TSigner, TAccounts>>,
    'instructions'
> & { feePayerSigner?: TSigner };

/** Extract all signers from an instruction that may contain IAccountSignerMeta accounts. */
export function getSignersFromInstruction<TSigner extends TransactionSigner = TransactionSigner>(
    instruction: IInstructionWithSigners<TSigner>,
): readonly TSigner[] {
    return deduplicateSigners(
        (instruction.accounts ?? []).flatMap(account => ('signer' in account ? account.signer : [])),
    );
}

/** Extract all signers from a transaction that may contain IAccountSignerMeta accounts. */
export function getSignersFromTransaction<
    TSigner extends TransactionSigner = TransactionSigner,
    TTransaction extends ITransactionWithSigners<TSigner> = ITransactionWithSigners<TSigner>,
>(transaction: TTransaction): readonly TSigner[] {
    return deduplicateSigners([
        ...(transaction.feePayerSigner ? [transaction.feePayerSigner] : []),
        ...transaction.instructions.flatMap(getSignersFromInstruction),
    ]);
}
