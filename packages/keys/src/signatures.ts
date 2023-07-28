import { assertSigningCapabilityIsAvailable, assertVerificationCapabilityIsAvailable } from '@solana/assertions';

export type Ed25519Signature = Uint8Array & { readonly __ed25519Signature: unique symbol };

export async function signBytes(key: CryptoKey, data: Uint8Array): Promise<Ed25519Signature> {
    await assertSigningCapabilityIsAvailable();
    const signedData = await crypto.subtle.sign('Ed25519', key, data);
    return new Uint8Array(signedData) as Ed25519Signature;
}

export async function verifySignature(key: CryptoKey, signature: Ed25519Signature, data: Uint8Array): Promise<boolean> {
    await assertVerificationCapabilityIsAvailable();
    return await crypto.subtle.verify('Ed25519', key, signature, data);
}
