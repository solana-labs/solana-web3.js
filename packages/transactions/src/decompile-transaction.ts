import { Address, assertIsAddress } from '@solana/addresses';
import { pipe } from '@solana/functional';
import { AccountRole, IAccountMeta, IInstruction } from '@solana/instructions';
import { SignatureBytes } from '@solana/keys';

import { Blockhash, setTransactionLifetimeUsingBlockhash } from './blockhash';
import { CompilableTransaction } from './compilable-transaction';
import { CompiledTransaction } from './compile-transaction';
import { createTransaction } from './create-transaction';
import { isAdvanceNonceAccountInstruction, Nonce, setTransactionLifetimeUsingDurableNonce } from './durable-nonce';
import { setTransactionFeePayer } from './fee-payer';
import { appendTransactionInstruction } from './instructions';
import { CompiledMessage } from './message';
import { ITransactionWithSignatures } from './signatures';
import { TransactionVersion } from './types';

function getAccountMetas(message: CompiledMessage): IAccountMeta[] {
    const { header } = message;
    const numWritableSignerAccounts = header.numSignerAccounts - header.numReadonlySignerAccounts;
    const numWritableNonSignerAccounts =
        message.staticAccounts.length - header.numSignerAccounts - header.numReadonlyNonSignerAccounts;

    const accountMetas: IAccountMeta[] = [];

    let accountIndex = 0;
    for (let i = 0; i < numWritableSignerAccounts; i++) {
        accountMetas.push({
            address: message.staticAccounts[accountIndex],
            role: AccountRole.WRITABLE_SIGNER,
        });
        accountIndex++;
    }

    for (let i = 0; i < header.numReadonlySignerAccounts; i++) {
        accountMetas.push({
            address: message.staticAccounts[accountIndex],
            role: AccountRole.READONLY_SIGNER,
        });
        accountIndex++;
    }

    for (let i = 0; i < numWritableNonSignerAccounts; i++) {
        accountMetas.push({
            address: message.staticAccounts[accountIndex],
            role: AccountRole.WRITABLE,
        });
        accountIndex++;
    }

    for (let i = 0; i < header.numReadonlyNonSignerAccounts; i++) {
        accountMetas.push({
            address: message.staticAccounts[accountIndex],
            role: AccountRole.READONLY,
        });
        accountIndex++;
    }

    return accountMetas;
}

function convertInstruction(
    instruction: CompiledMessage['instructions'][0],
    accountMetas: IAccountMeta[]
): IInstruction {
    const programAddress = accountMetas[instruction.programAddressIndex]?.address;
    if (!programAddress) {
        // TODO coded error
        throw new Error(`Could not find program address at index ${instruction.programAddressIndex}`);
    }

    const accounts = instruction.accountIndices?.map(accountIndex => accountMetas[accountIndex]);
    const { data } = instruction;

    return {
        programAddress,
        ...(accounts && accounts.length ? { accounts } : {}),
        ...(data && data.length ? { data } : {}),
    };
}

type LifetimeConstraint =
    | {
          blockhash: Blockhash;
          lastValidBlockHeight: bigint;
      }
    | {
          nonce: Nonce;
          nonceAccountAddress: Address;
          nonceAuthorityAddress: Address;
      };

function getLifetimeConstraint(
    messageLifetimeToken: string,
    firstInstruction?: IInstruction,
    lastValidBlockHeight?: bigint
): LifetimeConstraint {
    if (!firstInstruction || !isAdvanceNonceAccountInstruction(firstInstruction)) {
        // first instruction is not advance durable nonce, so use blockhash lifetime constraint
        return {
            blockhash: messageLifetimeToken as Blockhash,
            lastValidBlockHeight: lastValidBlockHeight ?? 2n ** 64n - 1n, // U64 MAX
        };
    } else {
        // We know these accounts are defined because we checked `isAdvanceNonceAccountInstruction`
        const nonceAccountAddress = firstInstruction.accounts![0].address;
        assertIsAddress(nonceAccountAddress);

        const nonceAuthorityAddress = firstInstruction.accounts![2].address;
        assertIsAddress(nonceAuthorityAddress);

        return {
            nonce: messageLifetimeToken as Nonce,
            nonceAccountAddress,
            nonceAuthorityAddress,
        };
    }
}

function convertSignatures(compiledTransaction: CompiledTransaction): ITransactionWithSignatures['signatures'] {
    const {
        compiledMessage: { staticAccounts },
        signatures,
    } = compiledTransaction;
    return signatures.reduce((acc, sig, index) => {
        // compiled transaction includes a fake all 0 signature if it hasn't been signed
        // we don't store those for the new tx model. So just skip if it's all 0s
        const allZeros = sig.every(byte => byte === 0);
        if (allZeros) return acc;

        const address = staticAccounts[index];
        return { ...acc, [address]: sig as SignatureBytes };
    }, {});
}

export function decompileTransaction(
    compiledTransaction: CompiledTransaction,
    lastValidBlockHeight?: bigint
): CompilableTransaction | (CompilableTransaction & ITransactionWithSignatures) {
    const { compiledMessage } = compiledTransaction;

    // TODO: add support for address lookup tables
    if ('addressTableLookups' in compiledMessage && compiledMessage.addressTableLookups!.length > 0) {
        // TODO: coded error
        throw new Error('Cannot convert transaction with addressTableLookups');
    }

    const feePayer = compiledMessage.staticAccounts[0];
    // TODO: coded error
    if (!feePayer) throw new Error('No fee payer set in CompiledTransaction');

    const accountMetas = getAccountMetas(compiledMessage);

    const instructions: IInstruction[] = compiledMessage.instructions.map(compiledInstruction =>
        convertInstruction(compiledInstruction, accountMetas)
    );

    const firstInstruction = instructions[0];
    const lifetimeConstraint = getLifetimeConstraint(
        compiledMessage.lifetimeToken,
        firstInstruction,
        lastValidBlockHeight
    );

    const signatures = convertSignatures(compiledTransaction);

    return pipe(
        createTransaction({ version: compiledMessage.version as TransactionVersion }),
        tx => setTransactionFeePayer(feePayer, tx),
        tx =>
            instructions.reduce((acc, instruction) => {
                return appendTransactionInstruction(instruction, acc);
            }, tx),
        tx =>
            'blockhash' in lifetimeConstraint
                ? setTransactionLifetimeUsingBlockhash(lifetimeConstraint, tx)
                : setTransactionLifetimeUsingDurableNonce(lifetimeConstraint, tx),
        tx => (compiledTransaction.signatures.length ? { ...tx, signatures } : tx)
    );
}
