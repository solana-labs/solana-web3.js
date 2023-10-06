import { base58 } from '@metaplex-foundation/umi-serializers';
import { Base58EncodedAddress, getAddressFromPublicKey } from '@solana/addresses';
import { Ed25519Signature, signBytes } from '@solana/keys';

import { CompiledMessage, compileMessage } from './message';
import { getCompiledMessageEncoder } from './serializers/message';

export interface IFullySignedTransaction extends ITransactionWithSignatures {
    readonly __brand: unique symbol;
}
export interface ITransactionWithSignatures {
    readonly signatures: Readonly<Record<Base58EncodedAddress, Ed25519Signature>>;
}

export type TransactionSignature = string & { readonly __brand: unique symbol };

export function assertIsTransactionSignature(
    putativeTransactionSignature: string
): asserts putativeTransactionSignature is TransactionSignature {
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
        const bytes = base58.serialize(putativeTransactionSignature);
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
    const bytes = base58.serialize(putativeTransactionSignature);
    const numBytes = bytes.byteLength;
    if (numBytes !== 64) {
        return false;
    }
    return true;
}

async function getCompiledMessageSignature(message: CompiledMessage, secretKey: CryptoKey) {
    const wireMessageBytes = getCompiledMessageEncoder().serialize(message);
    const signature = await signBytes(secretKey, wireMessageBytes);
    return signature;
}

export async function signTransaction<TTransaction extends Parameters<typeof compileMessage>[0]>(
    keyPairs: CryptoKeyPair[],
    transaction: TTransaction | (TTransaction & ITransactionWithSignatures)
): Promise<TTransaction & ITransactionWithSignatures> {
    const compiledMessage = compileMessage(transaction);
    const nextSignatures: Record<Base58EncodedAddress, Ed25519Signature> =
        'signatures' in transaction ? { ...transaction.signatures } : {};
    const publicKeySignaturePairs = await Promise.all(
        keyPairs.map(keyPair =>
            Promise.all([
                getAddressFromPublicKey(keyPair.publicKey),
                getCompiledMessageSignature(compiledMessage, keyPair.privateKey),
            ])
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
