import { type Address, assertIsAddress } from '@solana/addresses';
import {
    SOLANA_ERROR__TRANSACTION__ADDRESS_MISSING,
    SOLANA_ERROR__TRANSACTION__FEE_PAYER_MISSING,
    SOLANA_ERROR__TRANSACTION__INVALID_NONCE_TRANSACTION_FIRST_INSTRUCTION_MUST_BE_ADVANCE_NONCE,
    SOLANA_ERROR__TRANSACTION__INVALID_NONCE_TRANSACTION_INSTRUCTIONS_MISSING,
    SolanaError,
} from '@solana/errors';
import { pipe } from '@solana/functional';
import type { IAccountMeta, IInstruction } from '@solana/instructions';
import { AccountRole } from '@solana/instructions';
import type { SignatureBytes } from '@solana/keys';
import type { Blockhash } from '@solana/rpc-types';
import {
    appendTransactionInstruction,
    createTransaction,
    type IDurableNonceTransaction,
    isAdvanceNonceAccountInstruction,
    type ITransactionWithBlockhashLifetime,
    type ITransactionWithFeePayer,
    type ITransactionWithSignatures,
    type Nonce,
    setTransactionFeePayer,
    setTransactionLifetimeUsingBlockhash,
    setTransactionLifetimeUsingDurableNonce,
    type Transaction,
} from '@solana/transactions';
import type {
    MessageAccountKeys,
    MessageCompiledInstruction,
    PublicKey,
    VersionedMessage,
    VersionedTransaction,
} from '@solana/web3.js';

function convertAccount(
    message: VersionedMessage,
    accountKeys: MessageAccountKeys,
    accountIndex: number,
): IAccountMeta {
    const accountPublicKey = accountKeys.get(accountIndex);
    if (!accountPublicKey) {
        throw new SolanaError(SOLANA_ERROR__TRANSACTION__ADDRESS_MISSING, {
            index: accountIndex,
        });
    }
    const isSigner = message.isAccountSigner(accountIndex);
    const isWritable = message.isAccountWritable(accountIndex);

    const role = isSigner
        ? isWritable
            ? AccountRole.WRITABLE_SIGNER
            : AccountRole.READONLY_SIGNER
        : isWritable
          ? AccountRole.WRITABLE
          : AccountRole.READONLY;

    return {
        address: accountPublicKey.toBase58() as Address,
        role,
    };
}

function convertInstruction(
    message: VersionedMessage,
    accountKeys: MessageAccountKeys,
    instruction: MessageCompiledInstruction,
): IInstruction {
    const programAddressPublicKey = accountKeys.get(instruction.programIdIndex);
    if (!programAddressPublicKey) {
        throw new SolanaError(SOLANA_ERROR__TRANSACTION__ADDRESS_MISSING, {
            index: instruction.programIdIndex,
        });
    }

    const accounts = instruction.accountKeyIndexes.map(accountIndex =>
        convertAccount(message, accountKeys, accountIndex),
    );

    return {
        programAddress: programAddressPublicKey.toBase58() as Address,
        ...(accounts.length ? { accounts } : {}),
        ...(instruction.data.length ? { data: instruction.data } : {}),
    };
}

function convertSignatures(
    transaction: VersionedTransaction,
    staticAccountKeys: PublicKey[],
): ITransactionWithSignatures['signatures'] {
    return transaction.signatures.reduce((acc, sig, index) => {
        // legacy web3js includes a fake all 0 signature if it hasn't been signed
        // we don't do that for the new tx model. So just skip if it's all 0s
        const allZeros = sig.every(byte => byte === 0);
        if (allZeros) return acc;

        const address = staticAccountKeys[index].toBase58() as Address;
        return { ...acc, [address]: sig as SignatureBytes };
    }, {});
}

export function fromVersionedTransactionWithBlockhash(
    transaction: VersionedTransaction,
    lastValidBlockHeight?: bigint,
): ITransactionWithBlockhashLifetime & ITransactionWithFeePayer & Transaction {
    // TODO: add support for address table lookups
    // - will need to take `AddressLookupTableAccounts[]` as input
    // - will need to convert account instructions to `IAccountLookupMeta` when appropriate
    if (transaction.message.addressTableLookups.length > 0) {
        // TODO coded error
        // This should probably not be a `SolanaError`, since we need to add
        // this functionality.
        throw new Error('Cannot convert transaction with addressTableLookups');
    }

    const accountKeys = transaction.message.getAccountKeys();

    // Fee payer is first account
    const feePayer = accountKeys.staticAccountKeys[0];
    if (!feePayer) throw new SolanaError(SOLANA_ERROR__TRANSACTION__FEE_PAYER_MISSING);

    const blockhashLifetime = {
        blockhash: transaction.message.recentBlockhash as Blockhash,
        lastValidBlockHeight: lastValidBlockHeight ?? 2n ** 64n - 1n, // U64 MAX
    };

    const instructions = transaction.message.compiledInstructions.map(instruction =>
        convertInstruction(transaction.message, accountKeys, instruction),
    );

    const signatures = convertSignatures(transaction, accountKeys.staticAccountKeys);

    return pipe(
        createTransaction({ version: transaction.version }),
        tx => setTransactionFeePayer(feePayer.toBase58() as Address, tx),
        tx => setTransactionLifetimeUsingBlockhash(blockhashLifetime, tx),
        tx =>
            instructions.reduce((acc, instruction) => {
                return appendTransactionInstruction(instruction, acc);
            }, tx),
        tx => (transaction.signatures.length ? { ...tx, signatures } : tx),
    );
}

export function fromVersionedTransactionWithDurableNonce(
    transaction: VersionedTransaction,
): IDurableNonceTransaction & ITransactionWithFeePayer & Transaction {
    // TODO: add support for address table lookups
    // - will need to take `AddressLookupTableAccounts[]` as input
    // - will need to convert account instructions to `IAccountLookupMeta` when appropriate
    if (transaction.message.addressTableLookups.length > 0) {
        // TODO coded error
        // This should probably not be a `SolanaError`, since we need to add
        // this functionality.
        throw new Error('Cannot convert transaction with addressTableLookups');
    }

    const accountKeys = transaction.message.getAccountKeys();

    // Fee payer is first account
    const feePayer = accountKeys.staticAccountKeys[0];
    if (!feePayer) throw new SolanaError(SOLANA_ERROR__TRANSACTION__FEE_PAYER_MISSING);

    const instructions = transaction.message.compiledInstructions.map(instruction =>
        convertInstruction(transaction.message, accountKeys, instruction),
    );

    // Check first instruction is durable nonce + extract params
    if (instructions.length === 0) {
        throw new SolanaError(SOLANA_ERROR__TRANSACTION__INVALID_NONCE_TRANSACTION_INSTRUCTIONS_MISSING);
    }

    if (!isAdvanceNonceAccountInstruction(instructions[0])) {
        throw new SolanaError(
            SOLANA_ERROR__TRANSACTION__INVALID_NONCE_TRANSACTION_FIRST_INSTRUCTION_MUST_BE_ADVANCE_NONCE,
        );
    }

    // We know these accounts are defined because we checked `isAdvanceNonceAccountInstruction`
    const nonceAccountAddress = instructions[0].accounts![0].address;
    assertIsAddress(nonceAccountAddress);

    const nonceAuthorityAddress = instructions[0].accounts![2].address;
    assertIsAddress(nonceAuthorityAddress);

    const durableNonceLifetime = {
        nonce: transaction.message.recentBlockhash as Nonce,
        nonceAccountAddress,
        nonceAuthorityAddress,
    };

    const signatures = convertSignatures(transaction, accountKeys.staticAccountKeys);

    return pipe(
        createTransaction({ version: transaction.version }),
        tx => setTransactionFeePayer(feePayer.toBase58() as Address, tx),
        tx => setTransactionLifetimeUsingDurableNonce(durableNonceLifetime, tx),
        tx =>
            instructions.slice(1).reduce((acc, instruction) => {
                return appendTransactionInstruction(instruction, acc);
            }, tx),
        tx => (transaction.signatures.length ? { ...tx, signatures } : tx),
    );
}
