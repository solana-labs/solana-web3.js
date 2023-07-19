import { Base58EncodedAddress, Ed25519Signature, getBase58EncodedAddressFromPublicKey, signBytes } from '@solana/keys';

import { CompiledMessage, compileMessage } from './message';
import { getCompiledMessageEncoder } from './serializers/message';

export interface IFullySignedTransaction extends ITransactionWithSignatures {
    readonly __fullySignedTransaction: unique symbol;
}
export interface ITransactionWithSignatures {
    readonly signatures: { readonly [publicKey: Base58EncodedAddress]: Ed25519Signature };
}

async function getCompiledMessageSignature(message: CompiledMessage, secretKey: CryptoKey) {
    const wireMessageBytes = getCompiledMessageEncoder().serialize(message);
    const signature = await signBytes(secretKey, wireMessageBytes);
    return signature;
}

export async function signTransaction<TTransaction extends Parameters<typeof compileMessage>[0]>(
    keyPair: CryptoKeyPair,
    transaction: TTransaction | (TTransaction & ITransactionWithSignatures)
): Promise<TTransaction & ITransactionWithSignatures> {
    const compiledMessage = compileMessage(transaction);
    const [signerPublicKey, signature] = await Promise.all([
        getBase58EncodedAddressFromPublicKey(keyPair.publicKey),
        getCompiledMessageSignature(compiledMessage, keyPair.privateKey),
    ]);
    const nextSignatures = {
        ...('signatures' in transaction ? transaction.signatures : null),
        ...({ [signerPublicKey]: signature } as ITransactionWithSignatures['signatures']),
    };
    const out = {
        ...transaction,
        signatures: nextSignatures,
    };
    Object.freeze(out);
    return out;
}
