import { AccountRole, IAccountLookupMeta, IAccountMeta, IInstruction } from '@solana/instructions';
import { BaseTransaction, TransactionVersion } from '@solana/transactions';

import { deduplicateSigners } from './deduplicate-signers';
import { TransactionSigner } from './transaction-signer';

/** An extension of the IAccountMeta type that keeps track of its transaction signer. */
export interface IAccountSignerMeta<
    TAddress extends string = string,
    TSigner extends TransactionSigner = TransactionSigner
> extends IAccountMeta<TAddress> {
    readonly role: AccountRole.READONLY_SIGNER | AccountRole.WRITABLE_SIGNER;
    readonly signer: TSigner;
}

/** A variation of the IInstruction type that allows IAccountSignerMeta in its accounts array. */
type IAccountMetaWithWithSigner<TSigner extends TransactionSigner = TransactionSigner> =
    | IAccountMeta
    | IAccountLookupMeta
    | IAccountSignerMeta<string, TSigner>;
export type IInstructionWithSigners<
    TProgramAddress extends string = string,
    TSigner extends TransactionSigner = TransactionSigner,
    TAccounts extends readonly IAccountMetaWithWithSigner<TSigner>[] = readonly IAccountMetaWithWithSigner<TSigner>[]
> = IInstruction<TProgramAddress, TAccounts>;

/** Extract all signers from an instruction that may contain IAccountSignerMeta accounts. */
export function getSignersFromInstruction<TSigner extends TransactionSigner = TransactionSigner>(
    instruction: IInstructionWithSigners<string, TSigner>
): readonly TSigner[] {
    return deduplicateSigners(
        (instruction.accounts ?? []).flatMap(account => ('signer' in account ? account.signer : []))
    );
}

/** Extract all signers from a transaction that may contain IAccountSignerMeta accounts. */
export function getSignersFromTransaction<
    TSigner extends TransactionSigner = TransactionSigner,
    TInstruction extends IInstructionWithSigners<string, TSigner> = IInstructionWithSigners<string, TSigner>
>(transaction: BaseTransaction<TransactionVersion, TInstruction>): readonly TSigner[] {
    return deduplicateSigners(transaction.instructions.flatMap(getSignersFromInstruction));
}
