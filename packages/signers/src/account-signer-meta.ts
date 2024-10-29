import { AccountRole, IAccountLookupMeta, IAccountMeta, IInstruction } from '@solana/instructions';
import {
    BaseTransactionMessage,
    ITransactionMessageWithFeePayer,
    TransactionVersion,
} from '@solana/transaction-messages';

import { deduplicateSigners } from './deduplicate-signers';
import { ITransactionMessageWithFeePayerSigner } from './fee-payer-signer';
import { isTransactionSigner, TransactionSigner } from './transaction-signer';

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

/** A variation of the transaction message type that allows IAccountSignerMeta in its account metas. */
export type ITransactionMessageWithSigners<
    TAddress extends string = string,
    TSigner extends TransactionSigner<TAddress> = TransactionSigner<TAddress>,
    TAccounts extends readonly IAccountMetaWithSigner<TSigner>[] = readonly IAccountMetaWithSigner<TSigner>[],
> = Partial<ITransactionMessageWithFeePayer<TAddress> | ITransactionMessageWithFeePayerSigner<TAddress, TSigner>> &
    Pick<
        BaseTransactionMessage<TransactionVersion, IInstruction & IInstructionWithSigners<TSigner, TAccounts>>,
        'instructions'
    >;

/** Extract all signers from an instruction that may contain IAccountSignerMeta accounts. */
export function getSignersFromInstruction<TSigner extends TransactionSigner = TransactionSigner>(
    instruction: IInstructionWithSigners<TSigner>,
): readonly TSigner[] {
    return deduplicateSigners(
        (instruction.accounts ?? []).flatMap(account => ('signer' in account ? account.signer : [])),
    );
}

/** Extract all signers from a transaction message that may contain IAccountSignerMeta accounts. */
export function getSignersFromTransactionMessage<
    TAddress extends string = string,
    TSigner extends TransactionSigner<TAddress> = TransactionSigner<TAddress>,
    TTransactionMessage extends ITransactionMessageWithSigners<TAddress, TSigner> = ITransactionMessageWithSigners<
        TAddress,
        TSigner
    >,
>(transaction: TTransactionMessage): readonly TSigner[] {
    return deduplicateSigners([
        ...(transaction.feePayer && isTransactionSigner(transaction.feePayer) ? [transaction.feePayer as TSigner] : []),
        ...transaction.instructions.flatMap(getSignersFromInstruction),
    ]);
}
