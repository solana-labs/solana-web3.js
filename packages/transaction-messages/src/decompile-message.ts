import { Address, assertIsAddress } from '@solana/addresses';
import {
    SOLANA_ERROR__TRANSACTION__FAILED_TO_DECOMPILE_ADDRESS_LOOKUP_TABLE_CONTENTS_MISSING,
    SOLANA_ERROR__TRANSACTION__FAILED_TO_DECOMPILE_ADDRESS_LOOKUP_TABLE_INDEX_OUT_OF_RANGE,
    SOLANA_ERROR__TRANSACTION__FAILED_TO_DECOMPILE_FEE_PAYER_MISSING,
    SOLANA_ERROR__TRANSACTION__FAILED_TO_DECOMPILE_INSTRUCTION_PROGRAM_ADDRESS_NOT_FOUND,
    SolanaError,
} from '@solana/errors';
import { pipe } from '@solana/functional';
import { AccountRole, IAccountLookupMeta, IAccountMeta, IInstruction } from '@solana/instructions';
import type { Blockhash } from '@solana/rpc-types';

import { AddressesByLookupTableAddress } from './addresses-by-lookup-table-address';
import { setTransactionMessageLifetimeUsingBlockhash } from './blockhash';
import { CompilableTransactionMessage } from './compilable-transaction-message';
import { CompiledTransactionMessage } from './compile';
import type { getCompiledAddressTableLookups } from './compile/address-table-lookups';
import { createTransactionMessage } from './create-transaction-message';
import {
    isAdvanceNonceAccountInstruction,
    Nonce,
    setTransactionMessageLifetimeUsingDurableNonce,
} from './durable-nonce';
import { setTransactionMessageFeePayer } from './fee-payer';
import { appendTransactionMessageInstruction } from './instructions';
import { TransactionVersion } from './transaction-message';

function getAccountMetas(message: CompiledTransactionMessage): IAccountMeta[] {
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

function getAddressLookupMetas(
    compiledAddressTableLookups: ReturnType<typeof getCompiledAddressTableLookups>,
    addressesByLookupTableAddress: AddressesByLookupTableAddress,
): IAccountLookupMeta[] {
    // check that all message lookups are known
    const compiledAddressTableLookupAddresses = compiledAddressTableLookups.map(l => l.lookupTableAddress);
    const missing = compiledAddressTableLookupAddresses.filter(a => addressesByLookupTableAddress[a] === undefined);
    if (missing.length > 0) {
        throw new SolanaError(SOLANA_ERROR__TRANSACTION__FAILED_TO_DECOMPILE_ADDRESS_LOOKUP_TABLE_CONTENTS_MISSING, {
            lookupTableAddresses: missing,
        });
    }

    const readOnlyMetas: IAccountLookupMeta[] = [];
    const writableMetas: IAccountLookupMeta[] = [];

    // we know that for each lookup, knownLookups[lookup.lookupTableAddress] is defined
    for (const lookup of compiledAddressTableLookups) {
        const addresses = addressesByLookupTableAddress[lookup.lookupTableAddress];

        const highestIndex = Math.max(...lookup.readableIndices, ...lookup.writableIndices);
        if (highestIndex >= addresses.length) {
            throw new SolanaError(
                SOLANA_ERROR__TRANSACTION__FAILED_TO_DECOMPILE_ADDRESS_LOOKUP_TABLE_INDEX_OUT_OF_RANGE,
                {
                    highestKnownIndex: addresses.length - 1,
                    highestRequestedIndex: highestIndex,
                    lookupTableAddress: lookup.lookupTableAddress,
                },
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
    instruction: CompiledTransactionMessage['instructions'][0],
    accountMetas: IAccountMeta[],
): IInstruction {
    const programAddress = accountMetas[instruction.programAddressIndex]?.address;
    if (!programAddress) {
        throw new SolanaError(SOLANA_ERROR__TRANSACTION__FAILED_TO_DECOMPILE_INSTRUCTION_PROGRAM_ADDRESS_NOT_FOUND, {
            index: instruction.programAddressIndex,
        });
    }

    const accounts = instruction.accountIndices?.map(accountIndex => accountMetas[accountIndex]);
    const { data } = instruction;

    return Object.freeze({
        programAddress,
        ...(accounts && accounts.length ? { accounts: Object.freeze(accounts) } : {}),
        ...(data && data.length ? { data } : {}),
    });
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

export type DecompileTransactionMessageConfig = {
    addressesByLookupTableAddress?: AddressesByLookupTableAddress;
    lastValidBlockHeight?: bigint;
};

export function decompileTransactionMessage(
    compiledTransactionMessage: CompiledTransactionMessage,
    config?: DecompileTransactionMessageConfig,
): CompilableTransactionMessage {
    const feePayer = compiledTransactionMessage.staticAccounts[0];
    if (!feePayer) {
        throw new SolanaError(SOLANA_ERROR__TRANSACTION__FAILED_TO_DECOMPILE_FEE_PAYER_MISSING);
    }

    const accountMetas = getAccountMetas(compiledTransactionMessage);
    const accountLookupMetas =
        'addressTableLookups' in compiledTransactionMessage &&
        compiledTransactionMessage.addressTableLookups !== undefined &&
        compiledTransactionMessage.addressTableLookups.length > 0
            ? getAddressLookupMetas(
                  compiledTransactionMessage.addressTableLookups,
                  config?.addressesByLookupTableAddress ?? {},
              )
            : [];
    const transactionMetas = [...accountMetas, ...accountLookupMetas];

    const instructions: IInstruction[] = compiledTransactionMessage.instructions.map(compiledInstruction =>
        convertInstruction(compiledInstruction, transactionMetas),
    );

    const firstInstruction = instructions[0];
    const lifetimeConstraint = getLifetimeConstraint(
        compiledTransactionMessage.lifetimeToken,
        firstInstruction,
        config?.lastValidBlockHeight,
    );

    return pipe(
        createTransactionMessage({ version: compiledTransactionMessage.version as TransactionVersion }),
        tx => setTransactionMessageFeePayer(feePayer, tx),
        tx =>
            instructions.reduce((acc, instruction) => {
                return appendTransactionMessageInstruction(instruction, acc);
            }, tx),
        tx =>
            'blockhash' in lifetimeConstraint
                ? setTransactionMessageLifetimeUsingBlockhash(lifetimeConstraint, tx)
                : setTransactionMessageLifetimeUsingDurableNonce(lifetimeConstraint, tx),
    );
}
