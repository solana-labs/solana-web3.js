import { Address, assertIsAddress } from '@solana/addresses';
import { pipe } from '@solana/functional';
import { AccountRole, IAccountLookupMeta, IAccountMeta, IInstruction } from '@solana/instructions';
import { SignatureBytes } from '@solana/keys';

import { Blockhash, setTransactionLifetimeUsingBlockhash } from './blockhash';
import { CompilableTransaction } from './compilable-transaction';
import type { getCompiledAddressTableLookups } from './compile-address-table-lookups';
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

export type AddressesByLookupTableAddress = { [lookupTableAddress: Address]: Address[] };

function getAddressLookupMetas(
    compiledAddressTableLookups: ReturnType<typeof getCompiledAddressTableLookups>,
    addressesByLookupTableAddress: AddressesByLookupTableAddress,
): IAccountLookupMeta[] {
    // check that all message lookups are known
    const compiledAddressTableLookupAddresses = compiledAddressTableLookups.map(l => l.lookupTableAddress);
    const missing = compiledAddressTableLookupAddresses.filter(a => addressesByLookupTableAddress[a] === undefined);
    if (missing.length > 0) {
        const missingAddresses = missing.join(', ');
        // TODO: coded error.
        throw new Error(`Addresses not provided for lookup tables: [${missingAddresses}]`);
    }

    const readOnlyMetas: IAccountLookupMeta[] = [];
    const writableMetas: IAccountLookupMeta[] = [];

    // we know that for each lookup, knownLookups[lookup.lookupTableAddress] is defined
    for (const lookup of compiledAddressTableLookups) {
        const addresses = addressesByLookupTableAddress[lookup.lookupTableAddress];

        const highestIndex = Math.max(...lookup.readableIndices, ...lookup.writableIndices);
        if (highestIndex >= addresses.length) {
            // TODO coded error
            throw new Error(
                `Cannot look up index ${highestIndex} in lookup table [${lookup.lookupTableAddress}]. The lookup table may have been extended since the addresses provided were retrieved.`,
            );
        }

        const readOnlyForLookup: IAccountLookupMeta[] = lookup.readableIndices.map(r => ({
            address: addresses[r],
            addressIndex: r,
            lookupTableAddress: lookup.lookupTableAddress,
            role: AccountRole.READONLY,
        }));
        readOnlyMetas.push(...readOnlyForLookup);

        const writableForLookup: IAccountLookupMeta[] = lookup.writableIndices.map(w => ({
            address: addresses[w],
            addressIndex: w,
            lookupTableAddress: lookup.lookupTableAddress,
            role: AccountRole.WRITABLE,
        }));
        writableMetas.push(...writableForLookup);
    }

    return [...writableMetas, ...readOnlyMetas];
}

function convertInstruction(
    instruction: CompiledMessage['instructions'][0],
    accountMetas: IAccountMeta[],
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
    lastValidBlockHeight?: bigint,
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

export type DecompileTransactionConfig = {
    addressesByLookupTableAddress?: AddressesByLookupTableAddress;
    lastValidBlockHeight?: bigint;
};

export function decompileTransaction(
    compiledTransaction: CompiledTransaction,
    config?: DecompileTransactionConfig,
): CompilableTransaction | (CompilableTransaction & ITransactionWithSignatures) {
    const { compiledMessage } = compiledTransaction;

    const feePayer = compiledMessage.staticAccounts[0];
    // TODO: coded error
    if (!feePayer) throw new Error('No fee payer set in CompiledTransaction');

    const accountMetas = getAccountMetas(compiledMessage);
    const accountLookupMetas =
        'addressTableLookups' in compiledMessage &&
        compiledMessage.addressTableLookups !== undefined &&
        compiledMessage.addressTableLookups.length > 0
            ? getAddressLookupMetas(compiledMessage.addressTableLookups, config?.addressesByLookupTableAddress ?? {})
            : [];
    const transactionMetas = [...accountMetas, ...accountLookupMetas];

    const instructions: IInstruction[] = compiledMessage.instructions.map(compiledInstruction =>
        convertInstruction(compiledInstruction, transactionMetas),
    );

    const firstInstruction = instructions[0];
    const lifetimeConstraint = getLifetimeConstraint(
        compiledMessage.lifetimeToken,
        firstInstruction,
        config?.lastValidBlockHeight,
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
        tx => (compiledTransaction.signatures.length ? { ...tx, signatures } : tx),
    );
}
