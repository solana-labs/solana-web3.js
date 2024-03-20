import { Address } from '@solana/addresses';
import { AccountRole, IInstruction } from '@solana/instructions';
import type { Blockhash } from '@solana/rpc-types';
import {
    appendTransactionInstruction,
    CompilableTransaction,
    createTransaction,
    setTransactionFeePayer,
    setTransactionLifetimeUsingBlockhash,
} from '@solana/transactions';

import { IAccountSignerMeta, IInstructionWithSigners, ITransactionWithSigners } from '../account-signer-meta.js';
import { MessageModifyingSigner } from '../message-modifying-signer.js';
import { MessagePartialSigner } from '../message-partial-signer.js';
import { TransactionModifyingSigner } from '../transaction-modifying-signer.js';
import { TransactionPartialSigner } from '../transaction-partial-signer.js';
import { TransactionSendingSigner } from '../transaction-sending-signer.js';
import { TransactionSigner } from '../transaction-signer.js';

export function createMockInstructionWithSigners(signers: TransactionSigner[]): IInstruction & IInstructionWithSigners {
    return {
        accounts: signers.map(
            (signer): IAccountSignerMeta => ({ address: signer.address, role: AccountRole.READONLY_SIGNER, signer }),
        ),
        data: new Uint8Array([]),
        programAddress: '11111111111111111111111111111111' as Address,
    };
}

export function createMockTransactionWithSigners(
    signers: TransactionSigner[],
): CompilableTransaction & ITransactionWithSigners {
    const transaction = createTransaction({ version: 0 });
    const transactionWithFeePayer = setTransactionFeePayer(signers[0]?.address ?? '1111', transaction);
    const compilableTransaction = setTransactionLifetimeUsingBlockhash(
        { blockhash: 'dummy_blockhash' as Blockhash, lastValidBlockHeight: 42n },
        transactionWithFeePayer,
    );
    return appendTransactionInstruction(createMockInstructionWithSigners(signers), compilableTransaction);
}

export function createMockMessagePartialSigner(address: Address): MessagePartialSigner & { signMessages: jest.Mock } {
    return { address, signMessages: jest.fn() };
}

export function createMockMessageModifyingSigner(
    address: Address,
): MessageModifyingSigner & { modifyAndSignMessages: jest.Mock } {
    return { address, modifyAndSignMessages: jest.fn() };
}

export function createMockTransactionPartialSigner(
    address: Address,
): TransactionPartialSigner & { signTransactions: jest.Mock } {
    return { address, signTransactions: jest.fn() };
}

export function createMockTransactionModifyingSigner(
    address: Address,
): TransactionModifyingSigner & { modifyAndSignTransactions: jest.Mock } {
    return { address, modifyAndSignTransactions: jest.fn() };
}

export function createMockTransactionSendingSigner(
    address: Address,
): TransactionSendingSigner & { signAndSendTransactions: jest.Mock } {
    return { address, signAndSendTransactions: jest.fn() };
}

export function createMockTransactionCompositeSigner(address: Address) {
    return {
        ...createMockTransactionPartialSigner(address),
        ...createMockTransactionModifyingSigner(address),
        ...createMockTransactionSendingSigner(address),
    };
}
