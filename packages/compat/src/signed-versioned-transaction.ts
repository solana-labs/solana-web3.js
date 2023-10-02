import { VersionedTransaction } from '@solana/web3.js';

type NonEmptyArray<T> = [T, ...T[]];

export type SignedVersionedTransaction = Omit<VersionedTransaction, 'signatures'> & {
    signatures: NonEmptyArray<Uint8Array>;
};

function signatureIsAllZeros(signature: Uint8Array) {
    return signature.every(byte => byte === 0);
}

export function isSignedVersionedTransaction(
    versionedTransaction: VersionedTransaction
): versionedTransaction is SignedVersionedTransaction {
    return versionedTransaction.signatures.findIndex(sig => !signatureIsAllZeros(sig)) > -1;
}

export function assertIsSignedVersionedTransaction(
    versionedTransaction: VersionedTransaction
): asserts versionedTransaction is SignedVersionedTransaction {
    if (versionedTransaction.signatures.length === 0) {
        // TODO: coded error
        throw new Error('Input transaction is not signed');
    }

    const signaturesNotAllZeros = versionedTransaction.signatures.find(sig => !signatureIsAllZeros(sig));
    if (signaturesNotAllZeros === undefined) {
        // TODO: coded error
        throw new Error('Input transaction contains only all-zero signatures');
    }
}

export function signedVersionedTransaction(versionedTransaction: VersionedTransaction): SignedVersionedTransaction {
    assertIsSignedVersionedTransaction(versionedTransaction);
    return versionedTransaction;
}
