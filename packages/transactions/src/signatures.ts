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
