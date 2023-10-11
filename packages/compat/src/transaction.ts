import type { Base58EncodedAddress } from '@solana/addresses';
import { pipe } from '@solana/functional';
import type { IAccountMeta, IInstruction } from '@solana/instructions';
import { AccountRole } from '@solana/instructions';
import type { Ed25519Signature } from '@solana/keys';
import type {
    Blockhash,
    ITransactionWithBlockhashLifetime,
    ITransactionWithFeePayer,
    ITransactionWithSignatures,
    Transaction,
} from '@solana/transactions';
import {
    appendTransactionInstruction,
    createTransaction,
    setTransactionFeePayer,
    setTransactionLifetimeUsingBlockhash,
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
    accountIndex: number
): IAccountMeta {
    const accountPublicKey = accountKeys.get(accountIndex);
    if (!accountPublicKey) {
        // TODO coded error
        throw new Error(`Could not find account address at index ${accountIndex}`);
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
        address: accountPublicKey.toBase58() as Base58EncodedAddress,
        role,
    };
}

function convertInstruction(
    message: VersionedMessage,
    accountKeys: MessageAccountKeys,
    instruction: MessageCompiledInstruction
): IInstruction {
    const programAddressPublicKey = accountKeys.get(instruction.programIdIndex);
    if (!programAddressPublicKey) {
        // TODO coded error
        throw new Error(`Could not find program address at index ${instruction.programIdIndex}`);
    }

    const accounts = instruction.accountKeyIndexes.map(accountIndex =>
        convertAccount(message, accountKeys, accountIndex)
    );

    return {
        programAddress: programAddressPublicKey.toBase58() as Base58EncodedAddress,
        ...(accounts.length ? { accounts } : {}),
        ...(instruction.data.length ? { data: instruction.data } : {}),
    };
}

function convertSignatures(
    transaction: VersionedTransaction,
    staticAccountKeys: PublicKey[]
): ITransactionWithSignatures['signatures'] {
    return transaction.signatures.reduce((acc, sig, index) => {
        // legacy web3js includes a fake all 0 signature if it hasn't been signed
        // we don't do that for the new tx model. So just skip if it's all 0s
        const allZeros = sig.every(byte => byte === 0);
        if (allZeros) return acc;

        const address = staticAccountKeys[index].toBase58() as Base58EncodedAddress;
        return { ...acc, [address]: sig as Ed25519Signature };
    }, {});
}

export function fromVersionedTransactionWithBlockhash(
    transaction: VersionedTransaction,
    lastValidBlockHeight?: bigint
): Transaction & ITransactionWithFeePayer & ITransactionWithBlockhashLifetime {
    // TODO: add support for address table lookups
    // - will need to take `AddressLookupTableAccounts[]` as input
    // - will need to convert account instructions to `IAccountLookupMeta` when appropriate
    if (transaction.message.addressTableLookups.length > 0) {
        // TODO coded error
        throw new Error('Cannot convert transaction with addressTableLookups');
    }

    const accountKeys = transaction.message.getAccountKeys();

    // Fee payer is first account
    const feePayer = accountKeys.staticAccountKeys[0];
    // TODO: coded error
    if (!feePayer) throw new Error('No fee payer set in VersionedTransaction');

    // TOOD: add support for durable nonce transactions
    const blockhashLifetime = {
        blockhash: transaction.message.recentBlockhash as Blockhash,
        lastValidBlockHeight: lastValidBlockHeight ?? 2n ** 64n - 1n, // U64 MAX
    };

    const instructions = transaction.message.compiledInstructions.map(instruction =>
        convertInstruction(transaction.message, accountKeys, instruction)
    );

    const signatures = convertSignatures(transaction, accountKeys.staticAccountKeys);

    return pipe(
        createTransaction({ version: transaction.version }),
        tx => setTransactionFeePayer(feePayer.toBase58() as Base58EncodedAddress, tx),
        tx => setTransactionLifetimeUsingBlockhash(blockhashLifetime, tx),
        tx =>
            instructions.reduce((acc, instruction) => {
                return appendTransactionInstruction(instruction, acc);
            }, tx),
        tx => (transaction.signatures.length ? { ...tx, signatures } : tx)
    );
}
