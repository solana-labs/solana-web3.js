import { Address, getAddressFromPublicKey } from '@solana/addresses';
import { Decoder, Encoder } from '@solana/codecs-core';
import { getBase58Decoder, getBase58Encoder } from '@solana/codecs-strings';
import { isSignerRole } from '@solana/instructions';
import { Ed25519Signature, signBytes } from '@solana/keys';

import { CompilableTransaction } from './compilable-transaction';
import { ITransactionWithFeePayer } from './fee-payer';
import { compileMessage } from './message';
import { getCompiledMessageEncoder } from './serializers/message';

export interface IFullySignedTransaction extends ITransactionWithSignatures {
    readonly __brand: unique symbol;
}
export interface ITransactionWithSignatures {
    readonly signatures: Readonly<Record<Address, Ed25519Signature>>;
}

export type TransactionSignature = string & { readonly __brand: unique symbol };

let base58Encoder: Encoder<string> | undefined;
let base58Decoder: Decoder<string> | undefined;

export function assertIsTransactionSignature(
    putativeTransactionSignature: string
): asserts putativeTransactionSignature is TransactionSignature {
    if (!base58Encoder) base58Encoder = getBase58Encoder();

    try {
        // Fast-path; see if the input string is of an acceptable length.
        if (
            // Lowest value (64 bytes of zeroes)
            putativeTransactionSignature.length < 64 ||
            // Highest value (64 bytes of 255)
            putativeTransactionSignature.length > 88
        ) {
            throw new Error('Expected input string to decode to a byte array of length 64.');
        }
        // Slow-path; actually attempt to decode the input string.
        const bytes = base58Encoder.encode(putativeTransactionSignature);
        const numBytes = bytes.byteLength;
        if (numBytes !== 64) {
            throw new Error(`Expected input string to decode to a byte array of length 64. Actual length: ${numBytes}`);
        }
    } catch (e) {
        throw new Error(`\`${putativeTransactionSignature}\` is not a transaction signature`, {
            cause: e,
        });
    }
}

export function isTransactionSignature(
    putativeTransactionSignature: string
): putativeTransactionSignature is TransactionSignature {
    if (!base58Encoder) base58Encoder = getBase58Encoder();

    // Fast-path; see if the input string is of an acceptable length.
    if (
        // Lowest value (64 bytes of zeroes)
        putativeTransactionSignature.length < 64 ||
        // Highest value (64 bytes of 255)
        putativeTransactionSignature.length > 88
    ) {
        return false;
    }
    // Slow-path; actually attempt to decode the input string.
    const bytes = base58Encoder.encode(putativeTransactionSignature);
    const numBytes = bytes.byteLength;
    if (numBytes !== 64) {
        return false;
    }
    return true;
}

export function getSignatureFromTransaction(
    transaction: ITransactionWithFeePayer & ITransactionWithSignatures
): TransactionSignature {
    if (!base58Decoder) base58Decoder = getBase58Decoder();

    const signatureBytes = transaction.signatures[transaction.feePayer];
    if (!signatureBytes) {
        // TODO: Coded error.
        throw new Error(
            "Could not determine this transaction's signature. Make sure that the transaction " +
                'has been signed by its fee payer.'
        );
    }
    const transactionSignature = base58Decoder.decode(signatureBytes)[0];
    return transactionSignature as TransactionSignature;
}

export async function signTransaction<TTransaction extends CompilableTransaction>(
    keyPairs: CryptoKeyPair[],
    transaction: TTransaction | (TTransaction & ITransactionWithSignatures)
): Promise<TTransaction & ITransactionWithSignatures> {
    const compiledMessage = compileMessage(transaction);
    const nextSignatures: Record<Address, Ed25519Signature> =
        'signatures' in transaction ? { ...transaction.signatures } : {};
    const wireMessageBytes = getCompiledMessageEncoder().encode(compiledMessage);
    const publicKeySignaturePairs = await Promise.all(
        keyPairs.map(keyPair =>
            Promise.all([getAddressFromPublicKey(keyPair.publicKey), signBytes(keyPair.privateKey, wireMessageBytes)])
        )
    );
    for (const [signerPublicKey, signature] of publicKeySignaturePairs) {
        nextSignatures[signerPublicKey] = signature;
    }
    const out = {
        ...transaction,
        signatures: nextSignatures,
    };
    Object.freeze(out);
    return out;
}

export function transactionSignature(putativeTransactionSignature: string): TransactionSignature {
    assertIsTransactionSignature(putativeTransactionSignature);
    return putativeTransactionSignature;
}

export function assertTransactionIsFullySigned<TTransaction extends CompilableTransaction>(
    transaction: TTransaction & ITransactionWithSignatures
): asserts transaction is TTransaction & IFullySignedTransaction {
    const signerAddressesFromInstructions = transaction.instructions
        .flatMap(i => i.accounts?.filter(a => isSignerRole(a.role)) ?? [])
        .map(a => a.address);
    const requiredSigners = new Set([transaction.feePayer, ...signerAddressesFromInstructions]);

    requiredSigners.forEach(address => {
        if (!transaction.signatures[address]) {
            // TODO coded error
            throw new Error(`Transaction is missing signature for address \`${address}\``);
        }
    });
}
