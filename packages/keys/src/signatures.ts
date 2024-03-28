import { assertSigningCapabilityIsAvailable, assertVerificationCapabilityIsAvailable } from '@solana/assertions';
import { Encoder, ReadonlyUint8Array } from '@solana/codecs-core';
import { getBase58Encoder } from '@solana/codecs-strings';
import {
    SOLANA_ERROR__KEYS__INVALID_SIGNATURE_BYTE_LENGTH,
    SOLANA_ERROR__KEYS__SIGNATURE_STRING_LENGTH_OUT_OF_RANGE,
    SolanaError,
} from '@solana/errors';

export type Signature = string & { readonly __brand: unique symbol };
export type SignatureBytes = Uint8Array & { readonly __brand: unique symbol };

let base58Encoder: Encoder<string> | undefined;

export function assertIsSignature(putativeSignature: string): asserts putativeSignature is Signature {
    if (!base58Encoder) base58Encoder = getBase58Encoder();
    // Fast-path; see if the input string is of an acceptable length.
    if (
        // Lowest value (64 bytes of zeroes)
        putativeSignature.length < 64 ||
        // Highest value (64 bytes of 255)
        putativeSignature.length > 88
    ) {
        throw new SolanaError(SOLANA_ERROR__KEYS__SIGNATURE_STRING_LENGTH_OUT_OF_RANGE, {
            actualLength: putativeSignature.length,
        });
    }
    // Slow-path; actually attempt to decode the input string.
    const bytes = base58Encoder.encode(putativeSignature);
    const numBytes = bytes.byteLength;
    if (numBytes !== 64) {
        throw new SolanaError(SOLANA_ERROR__KEYS__INVALID_SIGNATURE_BYTE_LENGTH, {
            actualLength: numBytes,
        });
    }
}

export function isSignature(putativeSignature: string): putativeSignature is Signature {
    if (!base58Encoder) base58Encoder = getBase58Encoder();

    // Fast-path; see if the input string is of an acceptable length.
    if (
        // Lowest value (64 bytes of zeroes)
        putativeSignature.length < 64 ||
        // Highest value (64 bytes of 255)
        putativeSignature.length > 88
    ) {
        return false;
    }
    // Slow-path; actually attempt to decode the input string.
    const bytes = base58Encoder.encode(putativeSignature);
    const numBytes = bytes.byteLength;
    if (numBytes !== 64) {
        return false;
    }
    return true;
}

export async function signBytes(key: CryptoKey, data: ReadonlyUint8Array): Promise<SignatureBytes> {
    assertSigningCapabilityIsAvailable();
    const signedData = await crypto.subtle.sign('Ed25519', key, data);
    return new Uint8Array(signedData) as SignatureBytes;
}

export function signature(putativeSignature: string): Signature {
    assertIsSignature(putativeSignature);
    return putativeSignature;
}

export async function verifySignature(
    key: CryptoKey,
    signature: SignatureBytes,
    data: ReadonlyUint8Array,
): Promise<boolean> {
    assertVerificationCapabilityIsAvailable();
    return await crypto.subtle.verify('Ed25519', key, signature, data);
}
